package net.lumamc.web.store

import com.google.gson.GsonBuilder
import com.google.gson.JsonObject
import com.google.gson.JsonParser
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.AtomicMoveNotSupportedException
import java.nio.file.StandardCopyOption.*
import java.nio.file.StandardOpenOption.WRITE
import java.nio.channels.FileChannel
import java.nio.ByteBuffer
import java.security.MessageDigest
import java.time.Instant
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

internal fun writeStockFile(file: Path, contents: String) {
    val target = file.toAbsolutePath()
    Files.createDirectories(target.parent)
    val temporary = Files.createTempFile(target.parent, "stock-", ".tmp")
    try {
        FileChannel.open(temporary, WRITE).use { channel ->
            val buffer = ByteBuffer.wrap(contents.toByteArray(Charsets.UTF_8))
            while (buffer.hasRemaining()) channel.write(buffer)
            channel.force(true)
        }
        try { Files.move(temporary, target, ATOMIC_MOVE, REPLACE_EXISTING) }
        catch (_: AtomicMoveNotSupportedException) { Files.move(temporary, target, REPLACE_EXISTING) }
    } finally { Files.deleteIfExists(temporary) }
}

object TebexSignature {
    fun verify(body: ByteArray, supplied: String?, secret: String): Boolean {
        if (secret.isBlank() || supplied == null || !supplied.matches(Regex("[a-fA-F0-9]{64}"))) return false
        val hash = MessageDigest.getInstance("SHA-256").digest(body).joinToString("") { "%02x".format(it) }
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(secret.toByteArray(Charsets.UTF_8), "HmacSHA256"))
        val expected = mac.doFinal(hash.toByteArray(Charsets.UTF_8))
        val received = supplied.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
        return MessageDigest.isEqual(expected, received)
    }
}

data class StockPurchase(val transaction: String, val paidAt: Long, val quantities: Map<String, Long>, val refunded: Boolean)

/** Persist only inventory facts, never the webhook's customer/payment details.
 * A successful return means the transaction was durably written. */
class PurchaseHistory(private val file: Path, private val clock: () -> Long = { Instant.now().epochSecond }) {
    private val gson = GsonBuilder().setPrettyPrinting().create()
    private var purchases = linkedMapOf<String, StockPurchase>()

    init {
        if (Files.exists(file)) {
            // A corrupt purchase history must fail closed, never silently reset sold quantities.
            val root = JsonParser.parseString(Files.readString(file)).asJsonObject
            require(root.get("version")?.asInt == 1) { "Unsupported purchase history" }
            for (item in root.getAsJsonArray("purchases")) {
                val p = gson.fromJson(item, StockPurchase::class.java)
                require(p.transaction.isNotBlank() && p.paidAt > 0 && p.quantities.all { (id, qty) -> id.toLongOrNull()?.let { it > 0 } == true && qty > 0 })
                purchases[p.transaction] = p
            }
        }
    }

    @Synchronized
    fun accept(event: JsonObject): Boolean {
        val type = event.get("type")?.asString
        if (type != "payment.completed" && type != "payment.refunded") return false
        val subject = event.getAsJsonObject("subject") ?: error("Missing payment")
        val transaction = subject.get("transaction_id")?.asString ?: error("Missing transaction ID")
        require(transaction.length in 1..160)
        val paidAt = Instant.parse(subject.get("created_at").asString).epochSecond
        require(paidAt > 0 && paidAt <= clock() + 300)
        val quantities = linkedMapOf<String, Long>()
        for (element in subject.getAsJsonArray("products")) {
            val product = element.asJsonObject
            val id = product.get("id").asString
            val quantity = product.get("quantity").asString.toLongOrNull()
            require(id.toLongOrNull()?.let { it > 0 } == true && quantity != null && quantity in 1..1_000_000)
            quantities[id] = Math.addExact(quantities[id] ?: 0, quantity)
        }
        require(quantities.isNotEmpty())
        val old = purchases[transaction]
        // Deduplicate by transaction, even if Tebex sends a different event ID.
        // A late completion cannot undo a refund that arrived first.
        if (old != null) require(old.paidAt == paidAt && old.quantities == quantities) { "Conflicting transaction contents" }
        val next = StockPurchase(transaction, paidAt, quantities, old?.refunded == true || type == "payment.refunded")
        if (old == next) return false
        val updated = LinkedHashMap(purchases)
        updated[transaction] = next
        writeStockFile(file, gson.toJson(mapOf("version" to 1, "purchases" to updated.values)))
        purchases = updated
        return true
    }

    @Synchronized
    fun sold(packageId: String, cutoff: Long, restoreRefunds: Boolean): Long = purchases.values
        .filter { it.paidAt >= cutoff && it.paidAt <= clock() && !(restoreRefunds && it.refunded) }
        .sumOf { it.quantities[packageId] ?: 0 }
}
