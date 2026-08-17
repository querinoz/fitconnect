# FitConnect — Accent personalization (D17)

User may change **primary Volt only**.

Fixed: floor, carbon, type colors, Connect, telemetry, recovery amber, alert crimson, maps.

Allowed presets (existing tokens only — no new hues):

| Preset | Token | Label |
| ------ | ----- | ----- |
| VOLTLINE | `#C8FF00` | Voltline (default) |
| VOLT_400 | `#D0FF33` | Neon |
| VOLT_300 | `#D4FF4D` | Spring |
| VOLT_600 | `#A8D700` | Gold-green |

Persisted in `PreferenceKeys.ACCENT` via `ThemeSettings`. Light mode maps primary to `VOLT_600` for contrast.

Purple / red / blue themes are **forbidden**.
