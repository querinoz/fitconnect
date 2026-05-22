import { SignInClient } from "@/app/(marketing)/signin/sign-in-client";
import { RouteModal } from "@/components/shell/route-modal";

export default function SignInModalPage() {
  return (
    <RouteModal title="Sign in" size="center" className="max-w-lg !p-0 sm:!p-2">
      <div className="pt-12">
        <SignInClient embedded />
      </div>
    </RouteModal>
  );
}
