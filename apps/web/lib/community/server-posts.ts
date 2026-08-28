import type { CommunityPost } from "@/lib/data";
import { COMMUNITY_POSTS } from "@/lib/data";

export type ServerCommunityPost = CommunityPost & {
  source: "seed" | "user";
  createdAt: string;
};

const userPosts = new Map<string, ServerCommunityPost>();

function seedPosts(): ServerCommunityPost[] {
  return COMMUNITY_POSTS.map((p) => ({
    ...p,
    source: "seed" as const,
    createdAt: new Date(0).toISOString()
  }));
}

export function listCommunityPosts(): ServerCommunityPost[] {
  const merged = [...userPosts.values(), ...seedPosts()];
  return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function createCommunityPost(
  input: Omit<CommunityPost, "likes" | "comments" | "ago"> & {
    likes?: number;
    comments?: number;
    ago?: string;
  }
): ServerCommunityPost {
  const post: ServerCommunityPost = {
    ...input,
    likes: input.likes ?? 0,
    comments: input.comments ?? 0,
    ago: input.ago ?? "just now",
    source: "user",
    createdAt: new Date().toISOString()
  };
  userPosts.set(post.id, post);
  return post;
}

export function resetCommunityPostsForTests() {
  userPosts.clear();
}
