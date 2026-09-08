import SwiftUI

struct AthleteMessagesView: View {
    let threads: [MessageThread]
    let messages: [DemoMessage]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                LocalDemoBanner(note: "Messaging is rendered locally with a real thread and bubble layout.")

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
            }
            .padding(20)
        }
        .navigationTitle("Messages")
    }
}
