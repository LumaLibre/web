package net.lumamc.web.model;

import java.awt.image.BufferedImage;
import java.util.Arrays;

public final class SkinRenderer {

    private final BlockbenchModel model;

    public SkinRenderer(BlockbenchModel model) {
        this.model = model;
    }

    public BufferedImage render(BufferedImage skin, RenderOptions opt) {
        int ss = Math.max(1, opt.supersample);
        int w = opt.width * ss;
        int h = opt.height * ss;

        float[] zbuf = new float[w * h];
        Arrays.fill(zbuf, Float.NEGATIVE_INFINITY);

        int[] pixels = new int[w * h];
        Arrays.fill(pixels, opt.background.getRGB());

        Camera cam = new Camera(model, opt, w, h);

        int texW = skin.getWidth(), texH = skin.getHeight();
        double uScale = texW / model.uvWidth();
        double vScale = texH / model.uvHeight();

        for (BlockbenchModel.Triangle t : model.triangles()) {
            shadeAndRasterize(t, cam, skin, texW, texH, uScale, vScale, pixels, zbuf, w, h, opt.alphaCutoff);
        }

        BufferedImage hi = new BufferedImage(w, h, BufferedImage.TYPE_INT_ARGB);
        hi.setRGB(0, 0, w, h, pixels, 0, w);

        BufferedImage out = (ss == 1) ? hi : downsample(hi, opt.width, opt.height, ss);
        if (opt.trim) {
            out = trim(out, opt.trimPadding);
        }
        return out;
    }

    // Crop away the fully transparent border around the model. Padding adds
    // that many transparent pixels back on each side.
    private static BufferedImage trim(BufferedImage img, int padding) {
        int w = img.getWidth();
        int h = img.getHeight();

        int minX = w, minY = h, maxX = -1, maxY = -1;
        for (int y = 0; y < h; y++) {
            for (int x = 0; x < w; x++) {
                int alpha = (img.getRGB(x, y) >>> 24) & 0xFF;
                if (alpha == 0) {
                    continue;
                }
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }

        if (maxX < minX || maxY < minY) {
            return img;
        }

        int cropW = maxX - minX + 1;
        int cropH = maxY - minY + 1;
        int outW = cropW + padding * 2;
        int outH = cropH + padding * 2;

        BufferedImage out = new BufferedImage(outW, outH, BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < cropH; y++) {
            for (int x = 0; x < cropW; x++) {
                out.setRGB(x + padding, y + padding, img.getRGB(minX + x, minY + y));
            }
        }
        return out;
    }

    private void shadeAndRasterize(BlockbenchModel.Triangle t, Camera cam,
                                   BufferedImage skin, int texW, int texH,
                                   double uScale, double vScale,
                                   int[] pixels, float[] zbuf, int w, int h,
                                   int alphaCutoff) {
        double[] pa = cam.project(t.a);
        double[] pb = cam.project(t.b);
        double[] pc = cam.project(t.c);

        double brightness = faceBrightness(t.a, t.b, t.c);

        double x0 = pa[0], y0 = pa[1];
        double x1 = pb[0], y1 = pb[1];
        double x2 = pc[0], y2 = pc[1];

        double den = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
        if (Math.abs(den) < 1e-9) {
            return;
        }

        int minX = (int) Math.max(0, Math.floor(Math.min(x0, Math.min(x1, x2))));
        int maxX = (int) Math.min(w - 1, Math.ceil(Math.max(x0, Math.max(x1, x2))));
        int minY = (int) Math.max(0, Math.floor(Math.min(y0, Math.min(y1, y2))));
        int maxY = (int) Math.min(h - 1, Math.ceil(Math.max(y0, Math.max(y1, y2))));

        for (int py = minY; py <= maxY; py++) {
            for (int px = minX; px <= maxX; px++) {
                double fx = px + 0.5, fy = py + 0.5;
                double l0 = ((y1 - y2) * (fx - x2) + (x2 - x1) * (fy - y2)) / den;
                double l1 = ((y2 - y0) * (fx - x2) + (x0 - x2) * (fy - y2)) / den;
                double l2 = 1 - l0 - l1;
                if (l0 < -1e-4 || l1 < -1e-4 || l2 < -1e-4) {
                    continue;
                }

                float z = (float) (l0 * pa[2] + l1 * pb[2] + l2 * pc[2]);
                int idx = py * w + px;
                if (z <= zbuf[idx]) {
                    continue;
                }

                double u = l0 * t.uvA[0] + l1 * t.uvB[0] + l2 * t.uvC[0];
                double v = l0 * t.uvA[1] + l1 * t.uvB[1] + l2 * t.uvC[1];
                int tx = clamp((int) Math.floor(u * uScale), 0, texW - 1);
                int ty = clamp((int) Math.floor(v * vScale), 0, texH - 1);

                int argb = skin.getRGB(tx, ty);
                int alpha = (argb >>> 24) & 0xFF;
                if (alpha < alphaCutoff) {
                    continue;
                }

                int r = (int) Math.round(((argb >> 16) & 0xFF) * brightness);
                int g = (int) Math.round(((argb >> 8) & 0xFF) * brightness);
                int b = (int) Math.round((argb & 0xFF) * brightness);

                zbuf[idx] = z;
                pixels[idx] = (0xFF << 24) | (r << 16) | (g << 8) | b;
            }
        }
    }

    // Fixed brightness per face direction, like vanilla Minecraft.
    private static double faceBrightness(double[] a, double[] b, double[] c) {
        double ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
        double vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
        double nx = uy * vz - uz * vy;
        double ny = uz * vx - ux * vz;
        double nz = ux * vy - uy * vx;

        double len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        if (len < 1e-9) {
            return 0.8;
        }
        nx /= len;
        ny /= len;
        nz /= len;

        double ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
        if (ay >= ax && ay >= az) {
            return ny > 0 ? 1.00 : 0.50;
        }
        if (az >= ax) {
            return 0.80;
        }
        return 0.60;
    }

    private static int clamp(int v, int lo, int hi) {
        if (v < lo) {
            return lo;
        }
        if (v > hi) {
            return hi;
        }
        return v;
    }

    // Average each block of supersampled pixels back down, keeping alpha right.
    private static BufferedImage downsample(BufferedImage hi, int outW, int outH, int ss) {
        BufferedImage out = new BufferedImage(outW, outH, BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < outH; y++) {
            for (int x = 0; x < outW; x++) {
                long r = 0, g = 0, b = 0, a = 0;
                for (int dy = 0; dy < ss; dy++) {
                    for (int dx = 0; dx < ss; dx++) {
                        int argb = hi.getRGB(x * ss + dx, y * ss + dy);
                        int pa = (argb >>> 24) & 0xFF;
                        a += pa;
                        r += ((argb >> 16) & 0xFF) * pa;
                        g += ((argb >> 8) & 0xFF) * pa;
                        b += (argb & 0xFF) * pa;
                    }
                }

                int n = ss * ss;
                int avgA = (int) (a / n);
                int rr, gg, bb;
                if (a == 0) {
                    rr = 0;
                    gg = 0;
                    bb = 0;
                } else {
                    rr = (int) (r / a);
                    gg = (int) (g / a);
                    bb = (int) (b / a);
                }
                out.setRGB(x, y, (avgA << 24) | (rr << 16) | (gg << 8) | bb);
            }
        }
        return out;
    }


    private static final class Camera {
        private final double cYaw, sYaw, cPitch, sPitch;
        private final double cx, cy, cz;
        private final double scale;
        private final double halfW, halfH;

        Camera(BlockbenchModel model, RenderOptions opt, int w, int h) {
            // The face sits on the -Z side, so add 180 to make yaw 0 the front.
            double yaw = opt.yaw + 180;
            this.cYaw = Math.cos(Math.toRadians(yaw));
            this.sYaw = Math.sin(Math.toRadians(yaw));
            this.cPitch = Math.cos(Math.toRadians(opt.pitch));
            this.sPitch = Math.sin(Math.toRadians(opt.pitch));
            this.halfW = w / 2.0;
            this.halfH = h / 2.0;

            double minX = Double.MAX_VALUE, minY = Double.MAX_VALUE, minZ = Double.MAX_VALUE;
            double maxX = -Double.MAX_VALUE, maxY = -Double.MAX_VALUE, maxZ = -Double.MAX_VALUE;
            for (BlockbenchModel.Triangle t : model.triangles()) {
                for (double[] p : new double[][]{t.a, t.b, t.c}) {
                    minX = Math.min(minX, p[0]);
                    maxX = Math.max(maxX, p[0]);
                    minY = Math.min(minY, p[1]);
                    maxY = Math.max(maxY, p[1]);
                    minZ = Math.min(minZ, p[2]);
                    maxZ = Math.max(maxZ, p[2]);
                }
            }

            this.cx = (minX + maxX) / 2;
            this.cy = (minY + maxY) / 2;
            this.cz = (minZ + maxZ) / 2;

            if (opt.scale > 0) {
                this.scale = opt.scale * (w / (double) opt.width);
            } else {
                double ex = 0, ey = 0;
                double[][] corners = {
                    {minX, minY, minZ}, {maxX, minY, minZ}, {minX, maxY, minZ}, {maxX, maxY, minZ},
                    {minX, minY, maxZ}, {maxX, minY, maxZ}, {minX, maxY, maxZ}, {maxX, maxY, maxZ}};
                for (double[] c : corners) {
                    double[] rotated = rotateOnly(c);
                    ex = Math.max(ex, Math.abs(rotated[0]));
                    ey = Math.max(ey, Math.abs(rotated[1]));
                }
                double usableW = w * (1 - 2 * opt.fitMargin);
                double usableH = h * (1 - 2 * opt.fitMargin);
                this.scale = Math.min(usableW / (2 * ex), usableH / (2 * ey));
            }
        }

        private double[] rotateOnly(double[] p) {
            double x = p[0] - cx, y = p[1] - cy, z = p[2] - cz;
            double nx = x * cYaw + z * sYaw;
            double nz = -x * sYaw + z * cYaw;
            double ny = y * cPitch - nz * sPitch;
            nz = y * sPitch + nz * cPitch;
            return new double[]{nx, ny, nz};
        }

        double[] project(double[] p) {
            double[] r = rotateOnly(p);
            return new double[]{halfW + r[0] * scale, halfH - r[1] * scale, r[2]};
        }
    }
}