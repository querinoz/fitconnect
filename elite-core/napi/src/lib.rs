//! Server binding for elite-core (napi-rs).
//!
//! F0 status: skeleton — proves the crate builds as a native Node addon.
//! Consumed by Next.js route handlers / workers per ADR-006. Summary-row
//! writes go through this binding + Prisma per ADR-009; raw stream blobs
//! never round-trip through this layer (object storage instead).

#[macro_use]
extern crate napi_derive;

#[napi]
pub fn version() -> String {
    elite_core::version().to_string()
}
