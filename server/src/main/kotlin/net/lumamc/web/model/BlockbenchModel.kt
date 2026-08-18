package net.lumamc.web.model

import com.google.gson.JsonElement
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.nio.file.Files
import java.nio.file.Path
import kotlin.math.cos
import kotlin.math.sin

class BlockbenchModel private constructor(
    private val uvWidth: Double,
    private val uvHeight: Double
) {

    class Triangle(
        @JvmField val a: DoubleArray,
        @JvmField val b: DoubleArray,
        @JvmField val c: DoubleArray,
        @JvmField val uvA: DoubleArray,
        @JvmField val uvB: DoubleArray,
        @JvmField val uvC: DoubleArray
    )

    private val triangles = mutableListOf<Triangle>()

    fun triangles(): List<Triangle> = triangles

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

        val faces = element.getAsJsonObject("faces")
        for (face in FACE_NAMES) {
            if (!faces.has(face)) {
                continue
            }

            val faceData = faces.getAsJsonObject(face)
            if (!faceData.has("texture") || faceData.get("texture").isJsonNull || !faceData.has("uv")) {
                continue
            }

            val uv = faceData.getAsJsonArray("uv")
            val u1 = uv[0].asDouble
            val v1 = uv[1].asDouble
            val u2 = uv[2].asDouble
            val v2 = uv[3].asDouble
            val corners = faceCorners(face, x0, y0, z0, x1, y1, z1)

            val elementOrigin = vec3OrZero(element, "origin")
            val elementRotation = vec3OrZero(element, "rotation")
            for (index in corners.indices) {
                corners[index] = rotateAround(corners[index], elementOrigin, elementRotation)
                for (group in groupChain) {
                    corners[index] = rotateAround(
                        corners[index],
                        vec3(group.get("origin")),
                        vec3OrZero(group, "rotation")
                    )
                }
            }

            val topLeft = doubleArrayOf(u1, v1)
            val topRight = doubleArrayOf(u2, v1)
            val bottomRight = doubleArrayOf(u2, v2)
            val bottomLeft = doubleArrayOf(u1, v2)
            triangles += Triangle(corners[0], corners[1], corners[2], topLeft, topRight, bottomRight)
            triangles += Triangle(corners[0], corners[2], corners[3], topLeft, bottomRight, bottomLeft)
        }
    }

    companion object {
        private val FACE_NAMES = arrayOf("north", "south", "west", "east", "up", "down")

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
            val model = BlockbenchModel(uvWidth, uvHeight)

            val elements = mutableMapOf<String, JsonObject>()
            if (root.has("elements")) {
                for (element in root.getAsJsonArray("elements")) {
                    val elementObject = element.asJsonObject
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
            if (root.has("outliner")) {
                for (node in root.getAsJsonArray("outliner")) {
                    walkOutliner(node, emptyList(), groups, elements, ancestry)
                }
            }

            for ((id, element) in elements) {
                val type = if (element.has("type")) element.get("type").asString else "cube"
                if (type == "cube") {
                    model.addCube(element, ancestry[id].orEmpty())
                }
            }

            return model
        }

        private fun walkOutliner(
            node: JsonElement,
            ancestorsInnermostFirst: List<JsonObject>,
            groups: Map<String, JsonObject>,
            elements: Map<String, JsonObject>,
            output: MutableMap<String, List<JsonObject>>
        ) {
            if (node.isJsonPrimitive) {
                val id = node.asString
                if (elements.containsKey(id)) {
                    output[id] = ancestorsInnermostFirst.toList()
                }
                return
            }

            val nodeObject = node.asJsonObject
            val group = groups[nodeObject.get("uuid").asString]
            val nextAncestors = buildList {
                if (group != null) {
                    add(group)
                }
                addAll(ancestorsInnermostFirst)
            }

            if (nodeObject.has("children")) {
                for (child in nodeObject.getAsJsonArray("children")) {
                    walkOutliner(child, nextAncestors, groups, elements, output)
                }
            }
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
