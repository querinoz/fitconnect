import type { CommunityPost } from "@/lib/data";

const STORAGE_KEY = "fitconnect-community-posts";

export function loadLocalPosts(): CommunityPost[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPost(post: CommunityPost) {
  const existing = loadLocalPosts();
  const next = [post, ...existing].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function communityPostEventName() {
  return "fitconnect:community-post";
}

export function dispatchCommunityPost(post: CommunityPost) {
  window.dispatchEvent(new CustomEvent(communityPostEventName(), { detail: post }));
}
