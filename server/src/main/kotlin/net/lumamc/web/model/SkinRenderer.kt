package net.lumamc.web.model

import java.awt.image.BufferedImage
import kotlin.math.abs
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin
import kotlin.math.sqrt

class SkinRenderer(private val model: BlockbenchModel) {

    fun render(skin: BufferedImage, options: RenderOptions): BufferedImage {
        val supersample = max(1, options.supersample)
        val width = options.width * supersample
        val height = options.height * supersample
        val depthBuffer = FloatArray(width * height) { Float.NEGATIVE_INFINITY }
        val pixels = IntArray(width * height) { options.background.rgb }
        val camera = Camera(model, options, width, height)

        val textureWidth = skin.width
        val textureHeight = skin.height
        val horizontalTextureScale = textureWidth / model.uvWidth()
        val verticalTextureScale = textureHeight / model.uvHeight()

        for (triangle in model.triangles()) {
            shadeAndRasterize(
                triangle,
                camera,
                skin,
                textureWidth,
                textureHeight,
                horizontalTextureScale,
                verticalTextureScale,
                pixels,
                depthBuffer,
                width,
                height,
                options.alphaCutoff
            )
        }

        val highResolutionImage = BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB)
        highResolutionImage.setRGB(0, 0, width, height, pixels, 0, width)

        var output = if (supersample == 1) {
            highResolutionImage
        } else {
            downsample(highResolutionImage, options.width, options.height, supersample)
        }
        if (options.trim) {
            output = trim(output, options.trimPadding)
        }
        return output
    }

    private fun shadeAndRasterize(
        triangle: BlockbenchModel.Triangle,
        camera: Camera,
        skin: BufferedImage,
        textureWidth: Int,
        textureHeight: Int,
        horizontalTextureScale: Double,
        verticalTextureScale: Double,
        pixels: IntArray,
        depthBuffer: FloatArray,
        width: Int,
        height: Int,
        alphaCutoff: Int
    ) {
        val projectedA = camera.project(triangle.a)
        val projectedB = camera.project(triangle.b)
        val projectedC = camera.project(triangle.c)
        val brightness = faceBrightness(triangle.a, triangle.b, triangle.c)

        val x0 = projectedA[0]
        val y0 = projectedA[1]
        val x1 = projectedB[0]
        val y1 = projectedB[1]
        val x2 = projectedC[0]
        val y2 = projectedC[1]
        val denominator = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2)
        if (abs(denominator) < 1e-9) {
            return
        }

        val minimumX = max(0.0, floor(min(x0, min(x1, x2)))).toInt()
        val maximumX = min((width - 1).toDouble(), ceil(max(x0, max(x1, x2)))).toInt()
        val minimumY = max(0.0, floor(min(y0, min(y1, y2)))).toInt()
        val maximumY = min((height - 1).toDouble(), ceil(max(y0, max(y1, y2)))).toInt()

        for (pixelY in minimumY..maximumY) {
            for (pixelX in minimumX..maximumX) {
                val x = pixelX + 0.5
                val y = pixelY + 0.5
                val weight0 = ((y1 - y2) * (x - x2) + (x2 - x1) * (y - y2)) / denominator
                val weight1 = ((y2 - y0) * (x - x2) + (x0 - x2) * (y - y2)) / denominator
                val weight2 = 1 - weight0 - weight1
                if (weight0 < -1e-4 || weight1 < -1e-4 || weight2 < -1e-4) {
                    continue
                }

                val depth = (weight0 * projectedA[2] + weight1 * projectedB[2] + weight2 * projectedC[2]).toFloat()
                val pixelIndex = pixelY * width + pixelX
                if (depth <= depthBuffer[pixelIndex]) {
                    continue
                }

                val u = weight0 * triangle.uvA[0] + weight1 * triangle.uvB[0] + weight2 * triangle.uvC[0]
                val v = weight0 * triangle.uvA[1] + weight1 * triangle.uvB[1] + weight2 * triangle.uvC[1]
                val textureX = clamp(floor(u * horizontalTextureScale).toInt(), 0, textureWidth - 1)
                val textureY = clamp(floor(v * verticalTextureScale).toInt(), 0, textureHeight - 1)
                val color = skin.getRGB(textureX, textureY)
                val alpha = color ushr 24 and 0xFF
                if (alpha < alphaCutoff) {
                    continue
                }

                val red = (((color shr 16) and 0xFF) * brightness).roundToInt()
                val green = (((color shr 8) and 0xFF) * brightness).roundToInt()
                val blue = ((color and 0xFF) * brightness).roundToInt()

                depthBuffer[pixelIndex] = depth
                pixels[pixelIndex] = (0xFF shl 24) or (red shl 16) or (green shl 8) or blue
            }
        }
    }

    private class Camera(model: BlockbenchModel, options: RenderOptions, width: Int, height: Int) {
        private val cosineYaw: Double
        private val sineYaw: Double
        private val cosinePitch: Double
        private val sinePitch: Double
        private val centerX: Double
        private val centerY: Double
        private val centerZ: Double
        private val scale: Double
        private val halfWidth = width / 2.0
        private val halfHeight = height / 2.0

        init {
            val yaw = options.yaw + 180
            cosineYaw = cos(Math.toRadians(yaw))
            sineYaw = sin(Math.toRadians(yaw))
            cosinePitch = cos(Math.toRadians(options.pitch))
            sinePitch = sin(Math.toRadians(options.pitch))

            var minimumX = Double.MAX_VALUE
            var minimumY = Double.MAX_VALUE
            var minimumZ = Double.MAX_VALUE
            var maximumX = -Double.MAX_VALUE
            var maximumY = -Double.MAX_VALUE
            var maximumZ = -Double.MAX_VALUE
            for (triangle in model.triangles()) {
                for (point in arrayOf(triangle.a, triangle.b, triangle.c)) {
                    minimumX = min(minimumX, point[0])
                    maximumX = max(maximumX, point[0])
                    minimumY = min(minimumY, point[1])
                    maximumY = max(maximumY, point[1])
                    minimumZ = min(minimumZ, point[2])
                    maximumZ = max(maximumZ, point[2])
                }
            }

            centerX = (minimumX + maximumX) / 2
            centerY = (minimumY + maximumY) / 2
            centerZ = (minimumZ + maximumZ) / 2

            scale = if (options.scale > 0) {
                options.scale * (width / options.width.toDouble())
            } else {
                var horizontalExtent = 0.0
                var verticalExtent = 0.0
                val corners = arrayOf(
                    doubleArrayOf(minimumX, minimumY, minimumZ),
                    doubleArrayOf(maximumX, minimumY, minimumZ),
                    doubleArrayOf(minimumX, maximumY, minimumZ),
                    doubleArrayOf(maximumX, maximumY, minimumZ),
                    doubleArrayOf(minimumX, minimumY, maximumZ),
                    doubleArrayOf(maximumX, minimumY, maximumZ),
                    doubleArrayOf(minimumX, maximumY, maximumZ),
                    doubleArrayOf(maximumX, maximumY, maximumZ)
                )
                for (corner in corners) {
                    val rotated = rotateOnly(corner)
                    horizontalExtent = max(horizontalExtent, abs(rotated[0]))
                    verticalExtent = max(verticalExtent, abs(rotated[1]))
                }
                val usableWidth = width * (1 - 2 * options.fitMargin)
                val usableHeight = height * (1 - 2 * options.fitMargin)
                min(usableWidth / (2 * horizontalExtent), usableHeight / (2 * verticalExtent))
            }
        }

        private fun rotateOnly(point: DoubleArray): DoubleArray {
            val x = point[0] - centerX
            val y = point[1] - centerY
            val z = point[2] - centerZ
            val rotatedX = x * cosineYaw + z * sineYaw
            var rotatedZ = -x * sineYaw + z * cosineYaw
            val rotatedY = y * cosinePitch - rotatedZ * sinePitch
            rotatedZ = y * sinePitch + rotatedZ * cosinePitch
            return doubleArrayOf(rotatedX, rotatedY, rotatedZ)
        }

        fun project(point: DoubleArray): DoubleArray {
            val rotated = rotateOnly(point)
            return doubleArrayOf(
                halfWidth + rotated[0] * scale,
                halfHeight - rotated[1] * scale,
                rotated[2]
            )
        }
    }

    companion object {
        private fun trim(image: BufferedImage, padding: Int): BufferedImage {
            val width = image.width
            val height = image.height
            var minimumX = width
            var minimumY = height
            var maximumX = -1
            var maximumY = -1

            for (y in 0 until height) {
                for (x in 0 until width) {
                    val alpha = image.getRGB(x, y) ushr 24 and 0xFF
                    if (alpha == 0) {
                        continue
                    }
                    minimumX = min(minimumX, x)
                    maximumX = max(maximumX, x)
                    minimumY = min(minimumY, y)
                    maximumY = max(maximumY, y)
                }
            }

            if (maximumX < minimumX || maximumY < minimumY) {
                return image
            }

            val cropWidth = maximumX - minimumX + 1
            val cropHeight = maximumY - minimumY + 1
            val output = BufferedImage(
                cropWidth + padding * 2,
                cropHeight + padding * 2,
                BufferedImage.TYPE_INT_ARGB
            )
            for (y in 0 until cropHeight) {
                for (x in 0 until cropWidth) {
                    output.setRGB(x + padding, y + padding, image.getRGB(minimumX + x, minimumY + y))
                }
            }
            return output
        }

        private fun faceBrightness(a: DoubleArray, b: DoubleArray, c: DoubleArray): Double {
            val vectorUX = b[0] - a[0]
            val vectorUY = b[1] - a[1]
            val vectorUZ = b[2] - a[2]
            val vectorVX = c[0] - a[0]
            val vectorVY = c[1] - a[1]
            val vectorVZ = c[2] - a[2]
            var normalX = vectorUY * vectorVZ - vectorUZ * vectorVY
            var normalY = vectorUZ * vectorVX - vectorUX * vectorVZ
            var normalZ = vectorUX * vectorVY - vectorUY * vectorVX

            val length = sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ)
            if (length < 1e-9) {
                return 0.8
            }
            normalX /= length
            normalY /= length
            normalZ /= length

            val absoluteX = abs(normalX)
            val absoluteY = abs(normalY)
            val absoluteZ = abs(normalZ)
            if (absoluteY >= absoluteX && absoluteY >= absoluteZ) {
                return if (normalY > 0) 1.0 else 0.5
            }
            return if (absoluteZ >= absoluteX) 0.8 else 0.6
        }

        private fun clamp(value: Int, minimum: Int, maximum: Int): Int = when {
            value < minimum -> minimum
            value > maximum -> maximum
            else -> value
        }

        private fun downsample(
            highResolutionImage: BufferedImage,
            outputWidth: Int,
            outputHeight: Int,
            supersample: Int
        ): BufferedImage {
            val output = BufferedImage(outputWidth, outputHeight, BufferedImage.TYPE_INT_ARGB)
            for (y in 0 until outputHeight) {
                for (x in 0 until outputWidth) {
                    var red = 0L
                    var green = 0L
                    var blue = 0L
                    var alpha = 0L
                    for (offsetY in 0 until supersample) {
                        for (offsetX in 0 until supersample) {
                            val color = highResolutionImage.getRGB(
                                x * supersample + offsetX,
                                y * supersample + offsetY
                            )
                            val pixelAlpha = color ushr 24 and 0xFF
                            alpha += pixelAlpha
                            red += ((color shr 16) and 0xFF) * pixelAlpha
                            green += ((color shr 8) and 0xFF) * pixelAlpha
                            blue += (color and 0xFF) * pixelAlpha
                        }
                    }

                    val averageAlpha = (alpha / (supersample * supersample)).toInt()
                    val averageRed: Int
                    val averageGreen: Int
                    val averageBlue: Int
                    if (alpha == 0L) {
                        averageRed = 0
                        averageGreen = 0
                        averageBlue = 0
                    } else {
                        averageRed = (red / alpha).toInt()
                        averageGreen = (green / alpha).toInt()
                        averageBlue = (blue / alpha).toInt()
                    }
                    output.setRGB(
                        x,
                        y,
                        (averageAlpha shl 24) or (averageRed shl 16) or (averageGreen shl 8) or averageBlue
                    )
                }
            }
            return output
        }
    }
}
