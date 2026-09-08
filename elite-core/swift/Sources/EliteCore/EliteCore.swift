import Foundation

/// Hand contract mirroring `elite-core-uniffi` UniFFI API.
/// On Mac, prefer Generated UniFFI output over this stub.
public enum EliteCore {
    public static func version() -> String {
        "0.1.0"
    }

    /// LTHR 5-zone index (1–5), or 0 if `lthrBpm` invalid.
    /// Boundary math must match `elite_core::zones` golden tests when UniFFI is linked.
    public static func heartRateZone(bpm: Double, lthrBpm: Double) -> UInt8 {
        guard lthrBpm > 0 else { return 0 }
        let ratio = bpm / lthrBpm
        switch ratio {
        case ..<0.81: return 1
        case ..<0.90: return 2
        case ..<0.95: return 3
        case ..<1.00: return 4
        default: return 5
        }
    }
}
