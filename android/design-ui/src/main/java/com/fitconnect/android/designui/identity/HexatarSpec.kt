package com.fitconnect.android.designui.identity

enum class HexatarPattern {
    ORBIT,
    SHARD,
    CLUSTER,
    RADIAL,
    CHEVRON,
    TIDE,
    ROTOR,
    RIDGE,
}

enum class HexatarPalette {
    STEEL,
    CYAN,
    MINT,
    AMBER,
    VOLT,
    LEGEND,
}

data class HexatarSpec(
    val pattern: HexatarPattern,
    val palette: HexatarPalette,
    val rotationDeg: Float,
    val variant: Int,
)

object HexatarFactory {
    fun of(userId: String): HexatarSpec {
        val h = StableHash.of(userId)
        val pattern = HexatarPattern.entries[StableHash.bits(h, 0, 3)]
        val palette = HexatarPalette.entries[StableHash.bits(h, 3, 3) % HexatarPalette.entries.size]
        val rotation = (StableHash.bits(h, 6, 3) % 6) * 60f
        val variant = StableHash.bits(h, 9, 1)
        return HexatarSpec(pattern, palette, rotation, variant)
    }
}
