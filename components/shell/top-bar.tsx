"use client";

import Image from "next/image";
import { ThemePicker } from "./theme-picker";

export function TopBar({
  greeting,
  name,
  avatarUrl
}: {
  greeting: string;
  name: string;
  avatarUrl: string;
}) {
  return (
    <header className="px-5 pt-[calc(env(safe-area-inset-top)+12px)] pb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src={avatarUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 rounded-full border border-glass-border object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-400">
            {greeting}
          </p>
          <p className="text-base font-semibold truncate">{name}</p>
        </div>
      </div>
      <ThemePicker variant="dock" />
    </header>
  );
}
