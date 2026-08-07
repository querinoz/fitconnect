//! Android + Wear OS binding for elite-core (JNI).
//!
//! F0 status: skeleton — proves `elite-core` links against the `jni` crate
//! and produces a cdylib. No `#[no_mangle] extern "system" fn Java_...`
//! exports yet: JNI export symbol names are package-qualified
//! (`Java_<reversed_applicationId>_...`), and the Android `applicationId`
//! isn't decided yet (see `qa/HUMAN-QUEUE.md`). Real exports land once
//! that's settled and `android/` exists — see ADR-006 for the intended
//! shape (single `.so` per ABI, via UniFFI, with hand-written JNI as the
//! documented fallback for the Wear hot path if UniFFI ergonomics block us).

/// Re-exported so this crate has something real to compile and test against
/// before the actual JNI surface exists.
pub fn version() -> &'static str {
    elite_core::version()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn re_exports_core_version() {
        assert_eq!(version(), elite_core::version());
    }
}
