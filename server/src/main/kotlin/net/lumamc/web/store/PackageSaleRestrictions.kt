package net.lumamc.web.store

import java.text.Normalizer
import com.google.gson.GsonBuilder
import com.google.gson.JsonParser
import java.nio.file.Files
import java.nio.file.Path

data class CatalogPackage(val id: Long, val name: String)

class PackageSaleRestrictions(private val file: Path) {
    private val gson = GsonBuilder().setPrettyPrinting().create()
    private var blocked = linkedMapOf<Long, CatalogPackage>()

    init {
        if (Files.exists(file)) {
            val root = JsonParser.parseString(Files.readString(file)).asJsonObject
            require(root.get("version")?.asInt == 1) { "Unsupported package sale restrictions in $file" }
            for (item in root.getAsJsonArray("packages")) {
                val obj = item.asJsonObject
                val pkg = CatalogPackage(obj.get("id").asLong, obj.get("name").asString)
                require(pkg.id > 0 && pkg.name.isNotBlank()) { "Invalid package sale restriction in $file" }
                blocked[pkg.id] = pkg
            }
        }
    }

    @Synchronized
    fun toggle(pkg: CatalogPackage): Boolean {
        val updated = LinkedHashMap(blocked)
        val marked = updated.remove(pkg.id) == null
        if (marked) updated[pkg.id] = pkg
        // Publish the change only after it has been saved successfully.
        writeStockFile(file, gson.toJson(mapOf("version" to 1, "packages" to updated.values)))
        blocked = updated
        return marked
    }

    @Synchronized
    fun marked(id: Long): CatalogPackage? = blocked[id]

    @Synchronized
    fun applyTo(stock: Map<String, PackageStock>): Map<String, PackageStock> = stock.toMutableMap().apply {
        for (id in blocked.keys) {
            val key = id.toString()
            this[key] = (this[key] ?: PackageStock(null, null)).copy(notForSale = true)
        }
    }

    companion object {
        fun resolve(query: String, catalog: List<CatalogPackage>): CatalogPackage {
            val input = query.trim().trim('"', '\'')
            val packages = catalog.distinctBy { it.id }
            input.toLongOrNull()?.let { id ->
                return packages.find { it.id == id } ?: throw IllegalArgumentException("No package found with ID $id.")
            }
            val needle = normalize(input)
            require(needle.isNotEmpty()) { "Usage: nfs <package ID or name>" }
            val names = packages.associateWith { normalize(it.name) }
            val exact = packages.filter { names[it] == needle }
            val words = needle.split(' ')
            val partial = packages.filter { pkg -> words.all { names.getValue(pkg).contains(it) } }
            val matches = when {
                exact.isNotEmpty() -> exact
                partial.isNotEmpty() -> partial
                needle.length < 4 -> emptyList()
                else -> {
                    val scored = packages.map { pkg ->
                        val name = names.getValue(pkg)
                        pkg to (1.0 - distance(needle, name).toDouble() / maxOf(needle.length, name.length, 1))
                    }.filter { it.second >= 0.75 }.sortedByDescending { it.second }
                    scored.filter { it.second >= (scored.firstOrNull()?.second ?: 1.0) - 0.1 }.map { it.first }
                }
            }
            require(matches.isNotEmpty()) { "No package matched '$input'. Try more of its name or its Tebex ID." }
            require(matches.size == 1) {
                "Multiple packages match '$input'. Use an ID: " + matches.take(10).joinToString { "${it.name} (${it.id})" }
            }
            return matches.single()
        }

        private fun normalize(value: String) = Normalizer.normalize(value, Normalizer.Form.NFKD)
            .lowercase().replace(Regex("\\p{M}"), "").replace(Regex("[^\\p{L}\\p{N}]+"), " ").trim()

        private fun distance(a: String, b: String): Int {
            var previous = IntArray(b.length + 1) { it }
            for (i in a.indices) {
                val current = IntArray(b.length + 1)
                current[0] = i + 1
                for (j in b.indices) current[j + 1] = minOf(
                    current[j] + 1, previous[j + 1] + 1, previous[j] + if (a[i] == b[j]) 0 else 1)
                previous = current
            }
            return previous[b.length]
        }
    }
}
