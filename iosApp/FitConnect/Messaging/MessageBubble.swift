import SwiftUI

struct MessageBubble: View {
    let message: DemoMessage

    var body: some View {
        HStack {
            if message.isCurrentUser { Spacer(minLength: 36) }
            VStack(alignment: .leading, spacing: 6) {
                Text(message.sender.uppercased())
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .foregroundStyle(EosColors.textSecondary)
                Text(message.body)
                    .font(.body)
                    .foregroundStyle(EosColors.textPrimary)
                Text(message.timestamp)
                    .font(.caption)
                    .foregroundStyle(EosColors.muted)
            }
            .padding(14)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(message.isCurrentUser ? EosColors.iris.opacity(0.28) : EosColors.surfaceRaised)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke((message.isCurrentUser ? EosColors.iris : EosColors.telemetry).opacity(0.22), lineWidth: 1)
            )
            if !message.isCurrentUser { Spacer(minLength: 36) }
        }
    }
}
