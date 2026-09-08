import SwiftUI

struct CoachInboxView: View {
    let threads: [MessageThread]
    let messages: [DemoMessage]
    var onNavigate: (CoachRoute) -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Inbox is coach-first, with athlete threads and a path into notifications.")

                ForEach(threads) { thread in
                    GlassCard(accent: thread.accent) {
                        HStack {
                            VStack(alignment: .leading, spacing: 6) {
                                Text(thread.participant)
                                    .font(.headline)
                                    .foregroundStyle(EosColors.textPrimary)
                                Text(thread.preview)
                                    .foregroundStyle(EosColors.textSecondary)
                            }
                            Spacer(minLength: 8)
                            if thread.unreadCount > 0 {
                                Text("\(thread.unreadCount)")
                                    .font(.caption.bold())
                                    .foregroundStyle(EosColors.floor)
                                    .padding(8)
                                    .background(Circle().fill(thread.accent.color))
                            }
                        }
                    }
                }

                GlassCard(accent: .iris) {
                    Text("ACTIVE THREAD")
                        .font(.system(size: 11, weight: .medium, design: .monospaced))
                        .foregroundStyle(EosColors.textSecondary)
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }

                Button("Open notifications") {
                    onNavigate(.notifications)
                }
                .font(.headline)
                .foregroundStyle(EosColors.floor)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity)
                .background(Capsule().fill(EosColors.voltline))
                .buttonStyle(.plain)
            }
            .padding(20)
        }
    }
}
