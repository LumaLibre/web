package net.lumamc.web.model

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.awt.image.BufferedImage
import java.io.ByteArrayInputStream
import java.nio.file.Files
import java.nio.file.Path
import java.util.Base64
import javax.imageio.ImageIO
import kotlin.math.cos
import kotlin.math.sin

class BlockbenchModel private constructor(
    private val uvWidth: Double,
    private val uvHeight: Double,
    private val textures: List<Texture>,
    private val skinTexture: Int
) {

    class Texture(
        @JvmField val name: String,
        @JvmField val id: String?,
        @JvmField val uuid: String?,
        @JvmField val uvWidth: Double,
        @JvmField val uvHeight: Double,
        @JvmField val image: BufferedImage?
    )

    class Triangle(
        @JvmField val a: DoubleArray,
        @JvmField val b: DoubleArray,
        @JvmField val c: DoubleArray,
        @JvmField val uvA: DoubleArray,
        @JvmField val uvB: DoubleArray,
        @JvmField val uvC: DoubleArray,
        // Index into textures(), or -1 when the face did not name a texture we know about.
        @JvmField val texture: Int
    )

    private val triangles = mutableListOf<Triangle>()

    fun triangles(): List<Triangle> = triangles

    fun textures(): List<Texture> = textures

    // Index of the texture the player skin is painted onto, or -1 when the model has no such slot.
    fun skinTexture(): Int = skinTexture

    fun uvWidth(): Double = uvWidth

    fun uvHeight(): Double = uvHeight

    private fun addCube(element: JsonObject, groupChain: List<JsonObject>) {
        val inflate = optDouble(element, "inflate", 0.0)
        val from = vec3(element.get("from"))
        val to = vec3(element.get("to"))

        val x0 = from[0] - inflate
        val y0 = from[1] - inflate
        val z0 = from[2] - inflate
        val x1 = to[0] + inflate
        val y1 = to[1] + inflate
        val z1 = to[2] + inflate

        val faces = element.getAsJsonObject("faces") ?: return
        val elementOrigin = vec3OrZero(element, "origin")
        val elementRotation = vec3OrZero(element, "rotation")
        for (face in FACE_NAMES) {
            if (!faces.has(face)) {
                continue
            }

            val faceData = faces.getAsJsonObject(face)
            if (!faceData.has("uv")) {
                continue
            }
            val texture = textureIndex(faceData)
            if (texture == NO_TEXTURE && textures.isNotEmpty()) {
                // The face is deliberately untextured.
                continue
            }

            val uv = faceData.getAsJsonArray("uv")
            val u1 = uv[0].asDouble
            val v1 = uv[1].asDouble
            val u2 = uv[2].asDouble
            val v2 = uv[3].asDouble
            val corners = faceCorners(face, x0, y0, z0, x1, y1, z1)

            for (index in corners.indices) {
                corners[index] = rotateAround(corners[index], elementOrigin, elementRotation)
                for (group in groupChain) {
                    corners[index] = rotateAround(
                        corners[index],
                        vec3OrZero(group, "origin"),
                        vec3OrZero(group, "rotation")
                    )
                }
            }

            val topLeft = doubleArrayOf(u1, v1)
            val topRight = doubleArrayOf(u2, v1)
            val bottomRight = doubleArrayOf(u2, v2)
            val bottomLeft = doubleArrayOf(u1, v2)
            triangles += Triangle(corners[0], corners[1], corners[2], topLeft, topRight, bottomRight, texture)
            triangles += Triangle(corners[0], corners[2], corners[3], topLeft, bottomRight, bottomLeft, texture)
        }
    }

    private fun textureIndex(faceData: JsonObject): Int {
        val reference = faceData.get("texture")
        if (reference == null || reference.isJsonNull || !reference.isJsonPrimitive) {
            return NO_TEXTURE
        }

        val primitive = reference.asJsonPrimitive
        if (primitive.isNumber) {
            val index = primitive.asInt
            return if (index in textures.indices) index else NO_TEXTURE
        }

        val key = primitive.asString
        val index = textures.indexOfFirst { it.uuid == key || it.id == key }
        return if (index >= 0) index else NO_TEXTURE
    }

    companion object {
        private const val NO_TEXTURE = -1
        private val FACE_NAMES = arrayOf("north", "south", "west", "east", "up", "down")
        private val SKIN_NAME_HINTS = arrayOf("skin", "player", "_you", "steve")

        @JvmStatic
        fun load(file: Path): BlockbenchModel = parse(Files.readString(file))

        @JvmStatic
        fun parse(jsonText: String): BlockbenchModel {
            val root = JsonParser.parseString(jsonText).asJsonObject

            var uvWidth = 64.0
            var uvHeight = 64.0
            if (root.has("resolution")) {
                val resolution = root.getAsJsonObject("resolution")
                uvWidth = optDouble(resolution, "width", 64.0)
                uvHeight = optDouble(resolution, "height", 64.0)
            }

            val textures = parseTextures(root, uvWidth, uvHeight)
            val model = BlockbenchModel(uvWidth, uvHeight, textures, findSkinTexture(textures))

            val elements = mutableMapOf<String, JsonObject>()
            if (root.has("elements")) {
                for (element in root.getAsJsonArray("elements")) {
                    val elementObject = element.asJsonObject
                    if (!isVisible(elementObject)) {
                        continue
                    }
                    elements[elementObject.get("uuid").asString] = elementObject
                }
            }

            val groups = mutableMapOf<String, JsonObject>()
            if (root.has("groups")) {
                for (group in root.getAsJsonArray("groups")) {
                    val groupObject = group.asJsonObject
                    groups[groupObject.get("uuid").asString] = groupObject
                }
            }

            val ancestry = mutableMapOf<String, List<JsonObject>>()
            val hidden = mutableSetOf<String>()
            if (root.has("outliner")) {
                for (node in root.getAsJsonArray("outliner")) {
                    walkOutliner(node, emptyList(), groups, elements, ancestry, hidden)
                }
            }

            for ((id, element) in elements) {
                if (id in hidden) {
                    continue
                }
                val type = if (element.has("type")) element.get("type").asString else "cube"
                if (type == "cube") {
                    model.addCube(element, ancestry[id].orEmpty())
                }
            }

            return model
        }

        private fun parseTextures(root: JsonObject, uvWidth: Double, uvHeight: Double): List<Texture> {
            if (!root.has("textures")) {
                return emptyList()
            }

            return root.getAsJsonArray("textures").map { entry ->
                val texture = entry.asJsonObject
                Texture(
                    optString(texture, "name").orEmpty(),
                    optString(texture, "id"),
                    optString(texture, "uuid"),
                    optDouble(texture, "uv_width", optDouble(texture, "width", uvWidth)),
                    optDouble(texture, "uv_height", optDouble(texture, "height", uvHeight)),
                    decodeTexture(optString(texture, "source"))
                )
            }
        }

        private fun decodeTexture(source: String?): BufferedImage? {
            if (source.isNullOrBlank()) {
                return null
            }

            val payload = if (source.startsWith("data:")) {
                val comma = source.indexOf(',')
                if (comma < 0) return null else source.substring(comma + 1)
            } else {
                // A plain path to a file next to the model, which we do not follow.
                return null
            }

            return try {
                ImageIO.read(ByteArrayInputStream(Base64.getMimeDecoder().decode(payload)))
            } catch (e: Exception) {
                null
            }
        }

        private fun findSkinTexture(textures: List<Texture>): Int {
            if (textures.isEmpty()) {
                return NO_TEXTURE
            }
            if (textures.size == 1) {
                return 0
            }

            val skinSized = textures.indices.filter {
                textures[it].uvWidth == 64.0 && (textures[it].uvHeight == 64.0 || textures[it].uvHeight == 32.0)
            }
            val named = textures.indices.filter { index ->
                val name = textures[index].name.lowercase()
                SKIN_NAME_HINTS.any { name.contains(it) }
            }

            return skinSized.firstOrNull { it in named }
                ?: named.firstOrNull()
                ?: skinSized.singleOrNull()
                // Nothing looks like a skin, but a texture without an image can only be one.
                ?: textures.indices.firstOrNull { textures[it].image == null }
                ?: NO_TEXTURE
        }

        private fun walkOutliner(
            node: JsonElement,
            ancestorsInnermostFirst: List<JsonObject>,
            groups: Map<String, JsonObject>,
            elements: Map<String, JsonObject>,
            output: MutableMap<String, List<JsonObject>>,
            hidden: MutableSet<String>
        ) {
            if (node.isJsonPrimitive) {
                val id = node.asString
                if (elements.containsKey(id)) {
                    output[id] = ancestorsInnermostFirst.toList()
                }
                return
            }

            val nodeObject = node.asJsonObject
            // models either keep their groups in a separate list or inline them in the outliner.
            val group = groups[nodeObject.get("uuid").asString] ?: nodeObject
            if (!isVisible(group)) {
                collectIds(nodeObject, hidden)
                return
            }

            val nextAncestors = buildList {
                add(group)
                addAll(ancestorsInnermostFirst)
            }

            if (nodeObject.has("children")) {
                for (child in nodeObject.getAsJsonArray("children")) {
                    walkOutliner(child, nextAncestors, groups, elements, output, hidden)
                }
            }
        }

        private fun collectIds(node: JsonElement, output: MutableSet<String>) {
            if (node.isJsonPrimitive) {
                output += node.asString
                return
            }

            val nodeObject = node.asJsonObject
            if (nodeObject.has("children")) {
                for (child in nodeObject.getAsJsonArray("children")) {
                    collectIds(child, output)
                }
            }
        }

        private fun isVisible(node: JsonObject): Boolean {
            val exported = !node.has("export") || node.get("export").isJsonNull || node.get("export").asBoolean
            val visible = !node.has("visibility") ||
                node.get("visibility").isJsonNull ||
                node.get("visibility").asBoolean
            return exported && visible
        }

        private fun faceCorners(
            face: String,
            x0: Double,
            y0: Double,
            z0: Double,
            x1: Double,
            y1: Double,
            z1: Double
        ): Array<DoubleArray> = when (face) {
            "north" -> arrayOf(
                doubleArrayOf(x1, y1, z0), doubleArrayOf(x0, y1, z0),
                doubleArrayOf(x0, y0, z0), doubleArrayOf(x1, y0, z0)
            )
            "south" -> arrayOf(
                doubleArrayOf(x0, y1, z1), doubleArrayOf(x1, y1, z1),
                doubleArrayOf(x1, y0, z1), doubleArrayOf(x0, y0, z1)
            )
            "west" -> arrayOf(
                doubleArrayOf(x0, y1, z0), doubleArrayOf(x0, y1, z1),
                doubleArrayOf(x0, y0, z1), doubleArrayOf(x0, y0, z0)
            )
            "east" -> arrayOf(
                doubleArrayOf(x1, y1, z1), doubleArrayOf(x1, y1, z0),
                doubleArrayOf(x1, y0, z0), doubleArrayOf(x1, y0, z1)
            )
            "up" -> arrayOf(
                doubleArrayOf(x0, y1, z0), doubleArrayOf(x1, y1, z0),
                doubleArrayOf(x1, y1, z1), doubleArrayOf(x0, y1, z1)
            )
            "down" -> arrayOf(
                doubleArrayOf(x0, y0, z1), doubleArrayOf(x1, y0, z1),
                doubleArrayOf(x1, y0, z0), doubleArrayOf(x0, y0, z0)
            )
            else -> throw IllegalArgumentException("face $face")
        }

        private fun rotateAround(point: DoubleArray, origin: DoubleArray, rotationDegrees: DoubleArray): DoubleArray {
            if (rotationDegrees.all { it == 0.0 }) {
                return point
            }

            var x = point[0] - origin[0]
            var y = point[1] - origin[1]
            var z = point[2] - origin[2]
            val rotationX = Math.toRadians(rotationDegrees[0])
            val rotationY = Math.toRadians(rotationDegrees[1])
            val rotationZ = Math.toRadians(rotationDegrees[2])
            val cosineX = cos(rotationX)
            val sineX = sin(rotationX)
            val cosineY = cos(rotationY)
            val sineY = sin(rotationY)
            val cosineZ = cos(rotationZ)
            val sineZ = sin(rotationZ)

            var nextY = y * cosineX - z * sineX
            var nextZ = y * sineX + z * cosineX
            y = nextY
            z = nextZ

            var nextX = x * cosineY + z * sineY
            nextZ = -x * sineY + z * cosineY
            x = nextX
            z = nextZ

            nextX = x * cosineZ - y * sineZ
            nextY = x * sineZ + y * cosineZ

            return doubleArrayOf(nextX + origin[0], nextY + origin[1], z + origin[2])
        }

        private fun optDouble(jsonObject: JsonObject, key: String, default: Double): Double {
            return if (jsonObject.has(key) && !jsonObject.get(key).isJsonNull) {
                jsonObject.get(key).asDouble
            } else {
                default
            }
        }

        private fun optString(jsonObject: JsonObject, key: String): String? {
            return if (jsonObject.has(key) && !jsonObject.get(key).isJsonNull) {
                jsonObject.get(key).asString
            } else {
                null
            }
        }

        private fun vec3(element: JsonElement): DoubleArray {
            val array = element.asJsonArray
            return doubleArrayOf(array[0].asDouble, array[1].asDouble, array[2].asDouble)
        }

        private fun vec3OrZero(jsonObject: JsonObject, key: String): DoubleArray {
            return if (!jsonObject.has(key) || jsonObject.get(key).isJsonNull) {
                doubleArrayOf(0.0, 0.0, 0.0)
            } else {
                vec3(jsonObject.get(key))
            }
        }
    }
}
