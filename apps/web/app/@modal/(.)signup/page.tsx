"use client";

import { SignupWizard } from "@/components/auth/signup-wizard";
import { RouteModal } from "@/components/shell/route-modal";

export default function SignUpModalPage() {
  return (
    <RouteModal title="Sign up" size="center" className="max-w-xl !p-0 sm:!p-2">
      <div className="pt-12">
        <SignupWizard embedded />
      </div>
    </RouteModal>
  );
}
