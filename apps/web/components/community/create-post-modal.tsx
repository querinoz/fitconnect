"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import { useState } from "react";
import type { CommunityPost } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const POST_KINDS = ["PR", "Check-in", "Race", "Question"] as const;

type CreatePostModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublish: (post: CommunityPost) => void;
};

export function CreatePostModal({ open, onOpenChange, onPublish }: CreatePostModalProps) {
  const reduce = useReducedMotion();
  const [kind, setKind] = useState<(typeof POST_KINDS)[number]>("Check-in");
  const [text, setText] = useState("");

  function handlePublish() {
    if (!text.trim()) return;
    const post: CommunityPost = {
      id: `c-local-${Date.now()}`,
      author: {
        name: "You",
        avatar: "https://i.pravatar.cc/200?img=8",
        sport: "Running"
      },
      kind,
      text: text.trim(),
      likes: 0,
      comments: 0,
      ago: "just now"
    };
    onPublish(post);
    setText("");
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] bg-eos-floor/85 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content
              className={cn(
                "fixed left-1/2 top-1/2 z-[61] w-[calc(100%-1.5rem)] max-w-lg",
                "-translate-x-1/2 -translate-y-1/2 rounded-3xl",
                "border border-eos-voltline/15 bg-eos-mold/90 p-0 shadow-elevated focus:outline-none"
              )}
            >
              <motion.div
                initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              >
                <div className="flex items-center justify-between border-b border-eos-on-surface/10 px-5 py-4">
                  <Dialog.Title className="font-display text-lg font-bold text-eos-on-surface">
                    Share with community
                  </Dialog.Title>
                  <Dialog.Close className="grid h-8 w-8 place-items-center rounded-lg text-eos-on-surface-muted hover:bg-eos-carbon hover:text-eos-on-surface">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {POST_KINDS.map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setKind(k)}
                        className={cn(
                          "h-9 min-h-12 rounded-full border px-2.5 text-[10px] font-semibold uppercase",
                          kind === k
                            ? "border-eos-voltline bg-eos-voltline text-eos-floor"
                            : "border-eos-voltline/20 bg-eos-carbon text-eos-on-surface"
                        )}
                      >
                        {k}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder="Share a PR, check-in, or race report…"
                    className="w-full rounded-xl border border-eos-on-surface/10 bg-eos-floor px-3 py-2 text-sm text-eos-on-surface focus:outline-none focus:ring-2 focus:ring-eos-voltline/60"
                  />
                  <Button
                    type="button"
                    className="w-full bg-eos-voltline text-eos-floor hover:bg-eos-voltline"
                    disabled={!text.trim()}
                    onClick={handlePublish}
                  >
                    Post to feed
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
