import SwiftUI

struct SettingsForm: View {
    let sections: [SettingsSectionModel]
    @State private var toggleState: [String: Bool]

    init(sections: [SettingsSectionModel]) {
        self.sections = sections
        _toggleState = State(initialValue: SettingsForm.seed(sections: sections))
    }

    var body: some View {
        VStack(spacing: 16) {
            ForEach(sections) { section in
                GlassCard(accent: .iris) {
                    Text(section.title.uppercased())
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)

                    ForEach(section.rows) { row in
                        HStack(alignment: .top, spacing: 14) {
                            Image(systemName: row.systemImage)
                                .foregroundStyle(row.accent.color)
                                .frame(width: 24)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(row.title)
                                    .font(.headline)
                                    .foregroundStyle(EosColors.textPrimary)
                                Text(row.subtitle)
                                    .font(.subheadline)
                                    .foregroundStyle(EosColors.textSecondary)
                            }
                            Spacer(minLength: 8)
                            valueView(for: row)
                        }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func valueView(for row: SettingsRowModel) -> some View {
        switch row.value {
        case let .toggle(initial):
            Toggle("", isOn: Binding(
                get: { toggleState[row.id] ?? initial },
                set: { next in
                    toggleState[row.id] = next
                    persistGlance(id: row.id, value: next)
                }
            ))
            .labelsHidden()
            .tint(row.accent.color)
        case let .detail(text):
            Text(text)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(row.accent.color)
                .multilineTextAlignment(.trailing)
        }
    }

    private static func persistGlance(id: String, value: Bool) {
        let defaults = GlanceSharedStore.defaults()
        switch id {
        case "glance-recovery": defaults.set(value, forKey: "glance.showRecovery")
        case "glance-hr": defaults.set(value, forKey: "glance.showHeartRate")
        case "glance-lock": defaults.set(value, forKey: "glance.showLockDetails")
        case "glance-coach": defaults.set(value, forKey: "glance.showCoachNotifications")
        case "glance-device": defaults.set(value, forKey: "glance.showDeviceStatus")
        default: break
        }
    }

    private static func seed(sections: [SettingsSectionModel]) -> [String: Bool] {
        sections.reduce(into: [:]) { partial, section in
            for row in section.rows {
                if case let .toggle(value) = row.value {
                    switch row.id {
                    case "glance-recovery":
                        partial[row.id] = GlancePrivacy.showRecoveryOnWidget(GlanceSharedStore.defaults())
                    case "glance-hr":
                        partial[row.id] = GlancePrivacy.showHeartRateOnLiveActivity(GlanceSharedStore.defaults())
                    case "glance-lock":
                        partial[row.id] = GlancePrivacy.showWorkoutDetailsOnLockScreen(GlanceSharedStore.defaults())
                    default:
                        partial[row.id] = value
                    }
                }
            }
        }
    }
}
