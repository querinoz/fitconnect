import { DEMO_POSTS } from "@/lib/mock-data";
import { SCROLL_BOTTOM_INSET } from "@/lib/layout";
import { tokens } from "@/lib/tokens";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CommunityScreen() {
  const [posts, setPosts] = useState(DEMO_POSTS);
  const [draft, setDraft] = useState("");

  function publish() {
    if (!draft.trim()) return;
    setPosts([
      {
        id: `post-${Date.now()}`,
        author: "You",
        sport: "Training",
        body: draft.trim(),
        reactions: 0,
        ago: "now"
      },
      ...posts
    ]);
    setDraft("");
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Community</Text>
      <Card>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Share a PR or race report…"
          placeholderTextColor={tokens.colors.ink[500]}
          style={styles.input}
          multiline
        />
        <Button label="Post" onPress={publish} />
      </Card>
      {posts.map((post) => (
        <Card key={post.id}>
          <View style={styles.row}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.ago}>{post.ago}</Text>
          </View>
          {post.metric && <Text style={styles.metric}>{post.metric}</Text>}
          <Text style={styles.body}>{post.body}</Text>
          <Text style={styles.reactions}>💪 {post.reactions}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.colors.ink[950] },
  content: { padding: 16, gap: 12, paddingBottom: SCROLL_BOTTOM_INSET },
  title: { color: tokens.colors.ink[50], fontSize: 24, fontWeight: "800" },
  input: {
    minHeight: 72,
    color: tokens.colors.ink[100],
    marginBottom: 10,
    textAlignVertical: "top"
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  author: { color: tokens.colors.ink[100], fontWeight: "700" },
  ago: { color: tokens.colors.ink[500], fontSize: 12 },
  metric: { color: tokens.colors.accent[400], fontWeight: "700", marginTop: 6 },
  body: { color: tokens.colors.ink[300], marginTop: 6, lineHeight: 20 },
  reactions: { color: tokens.colors.ink[400], marginTop: 8, fontSize: 13 }
});
