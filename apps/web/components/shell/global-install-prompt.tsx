"use client";

import { InstallPrompt } from "@/components/shell/install-prompt";

export function GlobalInstallPrompt() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md sm:left-auto sm:right-6">
      <InstallPrompt />
    </div>
  );
}
