package net.lumamc.web.model;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


public final class BlockbenchModel {

    public static final class Triangle {
        public final double[] a, b, c;
        public final double[] uvA, uvB, uvC;

        Triangle(double[] a, double[] b, double[] c,
                 double[] uvA, double[] uvB, double[] uvC) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.uvA = uvA;
            this.uvB = uvB;
            this.uvC = uvC;
        }
    }

    private final List<Triangle> triangles = new ArrayList<>();
    private final double uvWidth, uvHeight;

    private BlockbenchModel(double uvWidth, double uvHeight) {
        this.uvWidth = uvWidth;
        this.uvHeight = uvHeight;
    }

    public List<Triangle> triangles() {
        return triangles;
    }

    public double uvWidth() {
        return uvWidth;
    }

    public double uvHeight() {
        return uvHeight;
    }

    public static BlockbenchModel load(Path file) throws IOException {
        return parse(new String(Files.readAllBytes(file), StandardCharsets.UTF_8));
    }

    public static BlockbenchModel parse(String jsonText) {
        JsonObject root = JsonParser.parseString(jsonText).getAsJsonObject();

        double uvW = 64, uvH = 64;
        if (root.has("resolution")) {
            JsonObject res = root.getAsJsonObject("resolution");
            uvW = optDouble(res, "width", 64);
            uvH = optDouble(res, "height", 64);
        }
        BlockbenchModel model = new BlockbenchModel(uvW, uvH);

        Map<String, JsonObject> elements = new HashMap<>();
        if (root.has("elements")) {
            for (JsonElement e : root.getAsJsonArray("elements")) {
                JsonObject eo = e.getAsJsonObject();
                elements.put(eo.get("uuid").getAsString(), eo);
            }
        }

        Map<String, JsonObject> groups = new HashMap<>();
        if (root.has("groups")) {
            for (JsonElement g : root.getAsJsonArray("groups")) {
                JsonObject go = g.getAsJsonObject();
                groups.put(go.get("uuid").getAsString(), go);
            }
        }

        // Find each element's chain of parent groups, innermost first.
        Map<String, List<JsonObject>> ancestry = new HashMap<>();
        if (root.has("outliner")) {
            for (JsonElement node : root.getAsJsonArray("outliner")) {
                walkOutliner(node, new ArrayList<>(), groups, elements, ancestry);
            }
        }

        for (Map.Entry<String, JsonObject> entry : elements.entrySet()) {
            JsonObject e = entry.getValue();
            String type = e.has("type") ? e.get("type").getAsString() : "cube";
            if (!"cube".equals(type)) {
                continue;
            }
            List<JsonObject> chain = ancestry.getOrDefault(entry.getKey(), new ArrayList<>());
            model.addCube(e, chain);
        }

        return model;
    }

    private static void walkOutliner(JsonElement node, List<JsonObject> ancestorsInnermostFirst, Map<String, JsonObject> groups, Map<String, JsonObject> elements, Map<String, List<JsonObject>> out) {
        if (node.isJsonPrimitive()) {
            String uuid = node.getAsString();
            if (elements.containsKey(uuid)) {
                out.put(uuid, new ArrayList<>(ancestorsInnermostFirst));
            }
            return;
        }

        JsonObject n = node.getAsJsonObject();
        JsonObject group = groups.get(n.get("uuid").getAsString());

        List<JsonObject> nextAncestors = new ArrayList<>();
        if (group != null) {
            nextAncestors.add(group);
        }
        nextAncestors.addAll(ancestorsInnermostFirst);

        if (n.has("children")) {
            for (JsonElement child : n.getAsJsonArray("children")) {
                walkOutliner(child, nextAncestors, groups, elements, out);
            }
        }
    }

    private static final String[] FACE_NAMES =
            {"north", "south", "west", "east", "up", "down"};

    private void addCube(JsonObject e, List<JsonObject> groupChain) {
        double inflate = optDouble(e, "inflate", 0.0);
        double[] from = vec3(e.get("from"));
        double[] to = vec3(e.get("to"));

        double x0 = from[0] - inflate, y0 = from[1] - inflate, z0 = from[2] - inflate;
        double x1 = to[0] + inflate, y1 = to[1] + inflate, z1 = to[2] + inflate;

        JsonObject faces = e.getAsJsonObject("faces");

        for (String face : FACE_NAMES) {
            if (!faces.has(face)) {
                continue;
            }

            JsonObject fd = faces.getAsJsonObject(face);
            // Faces with no texture are not drawn, like the hitbox cube.
            if (!fd.has("texture") || fd.get("texture").isJsonNull()) {
                continue;
            }
            if (!fd.has("uv")) {
                continue;
            }

            JsonArray uv = fd.getAsJsonArray("uv");
            double u1 = uv.get(0).getAsDouble(), v1 = uv.get(1).getAsDouble();
            double u2 = uv.get(2).getAsDouble(), v2 = uv.get(3).getAsDouble();

            double[][] corners = faceCorners(face, x0, y0, z0, x1, y1, z1);

            // Rotate by the element first, then up through the group chain.
            double[] elemOrigin = vec3OrZero(e, "origin");
            double[] elemRotation = vec3OrZero(e, "rotation");
            for (int k = 0; k < 4; k++) {
                corners[k] = rotateAround(corners[k], elemOrigin, elemRotation);
                for (JsonObject g : groupChain) {
                    corners[k] = rotateAround(corners[k], vec3(g.get("origin")), vec3OrZero(g, "rotation"));
                }
            }

            double[] tl = {u1, v1}, tr = {u2, v1}, br = {u2, v2}, bl = {u1, v2};
            triangles.add(new Triangle(corners[0], corners[1], corners[2], tl, tr, br));
            triangles.add(new Triangle(corners[0], corners[2], corners[3], tl, br, bl));
        }
    }

    // Face corners in the order top left, top right, bottom right, bottom left
    // so they line up with the uv corners.
    private static double[][] faceCorners(String face, double x0, double y0, double z0, double x1, double y1, double z1) {
        return switch (face) {
            case "north" -> new double[][]{{x1, y1, z0}, {x0, y1, z0}, {x0, y0, z0}, {x1, y0, z0}};
            case "south" -> new double[][]{{x0, y1, z1}, {x1, y1, z1}, {x1, y0, z1}, {x0, y0, z1}};
            case "west" -> new double[][]{{x0, y1, z0}, {x0, y1, z1}, {x0, y0, z1}, {x0, y0, z0}};
            case "east" -> new double[][]{{x1, y1, z1}, {x1, y1, z0}, {x1, y0, z0}, {x1, y0, z1}};
            case "up" -> new double[][]{{x0, y1, z0}, {x1, y1, z0}, {x1, y1, z1}, {x0, y1, z1}};
            case "down" -> new double[][]{{x0, y0, z1}, {x1, y0, z1}, {x1, y0, z0}, {x0, y0, z0}};
            default -> throw new IllegalArgumentException("face " + face);
        };
    }

    // Rotate a point around an origin using xyz euler angles in degrees.
    private static double[] rotateAround(double[] p, double[] origin, double[] rotDeg) {
        if (rotDeg[0] == 0 && rotDeg[1] == 0 && rotDeg[2] == 0) {
            return p;
        }

        double x = p[0] - origin[0], y = p[1] - origin[1], z = p[2] - origin[2];
        double rx = Math.toRadians(rotDeg[0]);
        double ry = Math.toRadians(rotDeg[1]);
        double rz = Math.toRadians(rotDeg[2]);
        double cx = Math.cos(rx), sx = Math.sin(rx);
        double cy = Math.cos(ry), sy = Math.sin(ry);
        double cz = Math.cos(rz), sz = Math.sin(rz);

        double ny = y * cx - z * sx, nz = y * sx + z * cx;
        y = ny;
        z = nz;

        double nx = x * cy + z * sy;
        nz = -x * sy + z * cy;
        x = nx;
        z = nz;

        nx = x * cz - y * sz;
        ny = x * sz + y * cz;
        x = nx;
        y = ny;

        return new double[]{x + origin[0], y + origin[1], z + origin[2]};
    }

    private static double optDouble(JsonObject o, String key, double def) {
        if (o.has(key) && !o.get(key).isJsonNull()) {
            return o.get(key).getAsDouble();
        }
        return def;
    }

    private static double[] vec3(JsonElement el) {
        JsonArray a = el.getAsJsonArray();
        return new double[]{a.get(0).getAsDouble(), a.get(1).getAsDouble(), a.get(2).getAsDouble()};
    }

    private static double[] vec3OrZero(JsonObject o, String key) {
        if (!o.has(key) || o.get(key).isJsonNull()) {
            return new double[]{0, 0, 0};
        }
        return vec3(o.get(key));
    }
}