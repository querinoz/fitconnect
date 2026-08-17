package com.fitconnect.android.designui.identity

/**
 * FNV-1a 32-bit. Stable across JVM versions — never use String.hashCode() for Hexatar.
 */
object StableHash {
    private const val OFFSET: Int = -2128831035 // FNV-1a 2166136261
    private const val PRIME: Int = 16777619

    fun of(input: String): Int {
        var hash = OFFSET
        val bytes = input.encodeToByteArray()
        var i = 0
        while (i < bytes.size) {
            hash = hash xor (bytes[i].toInt() and 0xFF)
            hash *= PRIME
            i++
        }
        return hash
    }

    fun bits(hash: Int, start: Int, width: Int): Int {
        val mask = if (width >= 32) -1 else (1 shl width) - 1
        return (hash ushr start) and mask
    }
}
