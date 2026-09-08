//! Android JNI exports for elite-core zone engine (UniFFI-compatible API).
//!
//! Same domain path as `elite-core-uniffi::heart_rate_zone` — single Rust source of truth.
//! Package: `com.fitconnect.android.sports.zones.EliteCoreNative`

use elite_core::zones::{zone_for, HEART_RATE_ZONES};
use jni::objects::JClass;
use jni::sys::{jdouble, jint, jstring};
use jni::JNIEnv;

fn heart_rate_zone_u8(bpm: f64, lthr_bpm: f64) -> u8 {
    if lthr_bpm <= 0.0 || !bpm.is_finite() {
        return 0;
    }
    zone_for(bpm, lthr_bpm, &HEART_RATE_ZONES)
        .map(|z| z.index)
        .unwrap_or(0)
}

#[no_mangle]
pub extern "system" fn Java_com_fitconnect_android_sports_zones_EliteCoreNative_nativeVersion<'local>(
    mut env: JNIEnv<'local>,
    _class: JClass<'local>,
) -> jstring {
    let s = elite_core::version();
    env.new_string(s)
        .expect("JNI string")
        .into_raw()
}

#[no_mangle]
pub extern "system" fn Java_com_fitconnect_android_sports_zones_EliteCoreNative_nativeHeartRateZone(
    _env: JNIEnv,
    _class: JClass,
    bpm: jdouble,
    lthr_bpm: jdouble,
) -> jint {
    heart_rate_zone_u8(bpm, lthr_bpm) as jint
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mirrors_uniffi_boundaries_lthr_170() {
        let lthr = 170.0;
        assert_eq!(heart_rate_zone_u8(100.0, lthr), 1);
        assert_eq!(heart_rate_zone_u8(137.0, lthr), 1);
        assert_eq!(heart_rate_zone_u8(138.0, lthr), 2);
        assert_eq!(heart_rate_zone_u8(153.0, lthr), 3);
        assert_eq!(heart_rate_zone_u8(160.0, lthr), 4);
        assert_eq!(heart_rate_zone_u8(170.0, lthr), 5);
        assert_eq!(heart_rate_zone_u8(150.0, 0.0), 0);
    }
}
