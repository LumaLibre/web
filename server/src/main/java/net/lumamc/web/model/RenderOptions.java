package net.lumamc.web.model;

import java.awt.Color;

public final class RenderOptions {

    public int width = 512;
    public int height = 768;

    // Spin around the vertical axis in degrees. 0 faces the camera.
    public double yaw = 0;

    // Tilt up and down in degrees. Negative looks down from above.
    public double pitch = 0;

    // Pixels per model unit. If this is 0 or less the model is auto fit.
    public double scale = -1;

    // Empty border kept around the model when auto fitting.
    public double fitMargin = 0.08;

    // Anti-aliasing factor. 1 is crisp, 2 to 4 smooths the edges.
    public int supersample = 1;

    // Image background. Transparent by default.
    public Color background = new Color(0, 0, 0, 0);

    // Texels with alpha below this value are treated as fully clear.
    public int alphaCutoff = 128;

    // Crop the transparent border so the image is tight to the model.
    public boolean trim = false;

    // Extra transparent pixels to keep around the model after trimming.
    public int trimPadding = 0;

    public RenderOptions() {
    }

    public RenderOptions size(int w, int h) {
        this.width = w;
        this.height = h;
        return this;
    }

    public RenderOptions angles(double yaw, double pitch) {
        this.yaw = yaw;
        this.pitch = pitch;
        return this;
    }

    public RenderOptions scale(double s) {
        this.scale = s;
        return this;
    }

    public RenderOptions supersample(int ss) {
        this.supersample = ss;
        return this;
    }

    public RenderOptions background(Color c) {
        this.background = c;
        return this;
    }

    public RenderOptions trim(boolean t) {
        this.trim = t;
        return this;
    }
}