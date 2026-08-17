package com.fitconnect.shared.source

/**
 * Every sample must declare how it was produced. Never upgrade LOCAL_DEMO
 * or TEST_FIXTURE to REAL_SENSOR.
 */
enum class DataSourceKind {
    REAL_SENSOR,
    EMULATED_SENSOR,
    TEST_FIXTURE,
    LOCAL_DEMO,
    /** Android Health Connect interoperability — not a live sensor. */
    HEALTH_CONNECT,
}
