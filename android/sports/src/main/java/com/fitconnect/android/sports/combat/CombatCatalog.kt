package com.fitconnect.android.sports.combat

/**
 * Discipline ids must match apps/web/lib/combat/taxonomy.ts.
 * Catalog data lives in the web Martial Arts OS; Android consumes stable ids.
 */
object CombatCatalog {
    const val SPORT = "MARTIAL_ARTS"

    val requiredIds: List<String> = listOf(
        "boxing", "muay_thai", "kickboxing", "mma", "bjj", "judo", "karate", "taekwondo",
        "wrestling", "sambo", "sanda", "wushu", "savate", "capoeira", "silat", "pencak_silat",
        "lethwei", "hapkido", "aikido", "kung_fu", "taijiquan", "kendo", "iaido", "taekkyeon",
        "kun_lbokator", "chidaoba", "kalaripayattu", "krav_maga", "wing_chun", "jeet_kune_do", "sumo",
        "catch_wrestling", "luta_livre",
    )

    fun isKnown(id: String): Boolean = requiredIds.contains(id.trim().lowercase().replace(' ', '_').replace('-', '_'))

    fun displayName(id: String): String = when (id) {
        "muay_thai" -> "Muay Thai"
        "bjj" -> "Brazilian Jiu-Jitsu"
        "mma" -> "MMA"
        "pencak_silat" -> "Pencak Silat"
        "kung_fu" -> "Kung Fu"
        "taijiquan" -> "Taijiquan"
        "kun_lbokator" -> "Kun Lbokator"
        "kalaripayattu" -> "Kalaripayattu"
        "krav_maga" -> "Krav Maga"
        "wing_chun" -> "Wing Chun"
        "jeet_kune_do" -> "Jeet Kune Do"
        "catch_wrestling" -> "Catch Wrestling"
        "luta_livre" -> "Luta Livre"
        else -> id.replace('_', ' ').replaceFirstChar { it.uppercase() }
    }

    fun familyOf(id: String): String = when (id) {
        "boxing", "muay_thai", "kickboxing", "savate", "taekwondo", "karate", "lethwei" -> "striking"
        "bjj", "judo", "wrestling", "sambo", "catch_wrestling", "luta_livre", "sumo" -> "grappling"
        "mma", "sanda", "jeet_kune_do" -> "mixed"
        "taijiquan" -> "internal"
        "krav_maga" -> "self_defense"
        else -> "traditional_cultural"
    }
}
