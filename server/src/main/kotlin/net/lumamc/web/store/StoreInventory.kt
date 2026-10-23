package net.lumamc.web.store

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import net.lumamc.web.configuration.Config
import org.slf4j.LoggerFactory
import java.nio.file.Path
import java.nio.file.Files
import java.time.Instant
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.RejectedExecutionException
import java.util.concurrent.atomic.AtomicBoolean

data class PackageStock(
    val global: CheckoutLimits.Limit?, val user: CheckoutLimits.Limit?,
    val remaining: Long? = null, val estimated: Boolean = true,
    val soldOut: Boolean = false, val checkedAt: Long = 0
)

object StockCalculation {
    fun calculate(id: String, limits: CheckoutLimits.Limits, purchaseHistory: PurchaseHistory?, now: Long,
                  freshness: Long, historyFrom: Long?, restoreRefunds: Boolean): PackageStock {
        val cutoff = limits.global?.timestamp
        val lifetime = cutoff == 0L
        val confirmedSoldOut = limits.globalSoldOutUntil > now || (lifetime && limits.globalSoldOutUntil > 0)
        val fresh = limits.observedAt > 0 && now - limits.observedAt in 0..freshness
        // A zero cutoff is Tebex's "No period" limit: count all recorded purchases.
        if (purchaseHistory == null || (!lifetime && !fresh) || cutoff == null || cutoff < 0 || cutoff > limits.observedAt) {
            return PackageStock(limits.global, limits.user, remaining = if (confirmedSoldOut) 0 else null,
                soldOut = confirmedSoldOut, checkedAt = limits.observedAt)
        }
        val remaining = (limits.global.limit.toLong() - purchaseHistory.sold(id, cutoff, restoreRefunds)).coerceAtLeast(0)
        return PackageStock(limits.global, limits.user, if (confirmedSoldOut) 0 else remaining,
            estimated = historyFrom == null || historyFrom > cutoff,
            soldOut = confirmedSoldOut || remaining == 0L, checkedAt = limits.observedAt)
    }
}

class StoreInventory(private val cfg: Config, directory: Path, val webhookSecret: String) : AutoCloseable {
    private val logger = LoggerFactory.getLogger(StoreInventory::class.java)
    private val purchaseHistory = runCatching { PurchaseHistory(directory.resolve("stock-ledger.json")) }.getOrElse {
        logger.error("Purchase history could not be loaded. Webhooks will return 503 until the purchase history is repaired.", it)
        null
    }
    private val interval = cfg.storeInspectionIntervalSeconds.coerceAtLeast(300)
    private val executor = Executors.newSingleThreadScheduledExecutor { task ->
        Thread(task, "tebex-package-inspector").apply { isDaemon = true }
    }
    private val refreshPending = AtomicBoolean(false)
    private val historyFrom = cfg.storeHistoryCompleteSince.takeIf { it.isNotBlank() }?.let {
        runCatching { Instant.parse(it).epochSecond }.getOrElse {
            logger.warn("Invalid storeHistoryCompleteSince; displaying upper bounds")
            null
        }
    }
    private val inspector by lazy { PackageInspector(
        TebexInspectionApi(cfg.storePublicToken, cfg.storeInspectionUsername),
        directory.resolve("stock-inspection-pending.json"), CheckoutLimits::observe,
        soldOut = { id ->
            val previous = CheckoutLimits.knownLimits()[id.toString()] ?: CheckoutLimits.Limits(null, null)
            CheckoutLimits.observe(mapOf(id.toString() to previous.copy(globalSoldOutUntil = Instant.now().epochSecond + interval * 2)))
        }, report = { id, message -> logger.info("Package {} inspection: {}", id, message) }
    ) }

    fun start() {
        if (!cfg.storeInspectionEnabled || cfg.storeInspectionUsername.isBlank()) {
            logger.info("Automatic limit discovery is disabled; configure storeInspectionEnabled and storeInspectionUsername to enable it.")
            return
        }
        executor.scheduleWithFixedDelay({
            if (refreshPending.compareAndSet(false, true)) inspectPackages()
        }, 0, interval, TimeUnit.SECONDS)
    }

    /** Console only. Shares the scheduled worker so private baskets never overlap. */
    fun refresh(): String {
        if (cfg.storeInspectionUsername.isBlank() || cfg.storePublicToken.isBlank()) {
            return "Cannot refresh: configure storeInspectionUsername and storePublicToken in config.yml."
        }
        if (!refreshPending.compareAndSet(false, true)) return "A Tebex refresh is already running or queued."
        try {
            executor.execute { inspectPackages(manual = true) }
        } catch (_: RejectedExecutionException) {
            refreshPending.set(false)
            return "Cannot refresh while the store server is stopping."
        }
        return "Tebex refresh queued. Package limits and availability will update as inspection completes."
    }

    private fun inspectPackages(manual: Boolean = false) {
        try {
            if (manual) logger.info("Refreshing Tebex package limits, including LTO packages. Discord-required packages are skipped.")
            inspector.run(cfg.storeInspectionPackageIds, cfg.storeInspectionVariables)
            if (manual) logger.info("Tebex refresh finished. See inspection messages for any package failures. Store stock updates within 15 seconds.")
        } catch (e: InterruptedException) {
            Thread.currentThread().interrupt()
            if (manual) logger.info("Tebex refresh interrupted; already discovered limits were saved.")
        } catch (e: Exception) {
            logger.warn("Tebex refresh did not finish ({}). Previously saved limits are retained; retry with 'refresh'.", e.javaClass.simpleName)
        } finally {
            refreshPending.set(false)
        }
    }

    fun accept(event: JsonObject): Boolean = (purchaseHistory ?: error("Purchase history unavailable")).accept(event)

    fun importHistory(file: Path): Int {
        val events = JsonParser.parseString(Files.readString(file)).asJsonArray
        var accepted = 0
        for (event in events) {
            val value = event.asJsonObject
            require(value.get("type")?.asString in setOf("payment.completed", "payment.refunded"))
            if (accept(value)) accepted++
        }
        return accepted
    }

    fun snapshot(): Map<String, PackageStock> {
        val now = Instant.now().epochSecond
        return CheckoutLimits.knownLimits().mapValues { (id, limits) ->
            StockCalculation.calculate(id, limits, purchaseHistory.takeIf { webhookSecret.isNotBlank() }, now,
                interval * 2, historyFrom, id.toLong() in cfg.storeRefundRestoresPackageIds)
        }
    }

    override fun close() { executor.shutdownNow() }
}
