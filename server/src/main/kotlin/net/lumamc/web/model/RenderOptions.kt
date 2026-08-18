package net.lumamc.web.model

import java.awt.Color

class RenderOptions {

    @JvmField var width: Int = 512
    @JvmField var height: Int = 768

    // Spin around the vertical axis in degrees. 0 faces the camera.
    @JvmField var yaw: Double = 0.0

    // Tilt up and down in degrees. Negative looks down from above.
    @JvmField var pitch: Double = 0.0

    // Pixels per model unit. If this is 0 or less the model is auto fit.
    @JvmField var scale: Double = -1.0

    // Empty border kept around the model when auto fitting.
    @JvmField var fitMargin: Double = 0.08

    // Anti-aliasing factor. 1 is crisp, 2 to 4 smooths the edges.
    @JvmField var supersample: Int = 1

    // Image background. Transparent by default.
    @JvmField var background: Color = Color(0, 0, 0, 0)

    // Texels with alpha below this value are treated as fully clear.
    @JvmField var alphaCutoff: Int = 128

    // Crop the transparent border so the image is tight to the model.
    @JvmField var trim: Boolean = false

    // Extra transparent pixels to keep around the model after trimming.
    @JvmField var trimPadding: Int = 0

    fun size(width: Int, height: Int): RenderOptions = apply {
        this.width = width
        this.height = height
    }

    fun angles(yaw: Double, pitch: Double): RenderOptions = apply {
        this.yaw = yaw
        this.pitch = pitch
    }

    fun scale(scale: Double): RenderOptions = apply {
        this.scale = scale
    }

    fun supersample(supersample: Int): RenderOptions = apply {
        this.supersample = supersample
    }

    fun background(background: Color): RenderOptions = apply {
        this.background = background
    }

    fun trim(trim: Boolean): RenderOptions = apply {
        this.trim = trim
    }
}
