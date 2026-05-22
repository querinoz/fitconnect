import { SignInClient } from "@/app/(marketing)/signin/sign-in-client";
import { RouteModal } from "@/components/shell/route-modal";

export default function SignInModalPage() {
  return (
    <RouteModal title="Sign in" size="center">
      <SignInClient embedded />
    </RouteModal>
  );
}
