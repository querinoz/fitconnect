import PricingPage from "@/app/(marketing)/pricing/page";
import { RouteModal } from "@/components/shell/route-modal";

export default function PricingModalPage() {
  return (
    <RouteModal title="Pricing" size="sheet" className="p-0 sm:p-0">
      <div className="h-full overflow-y-auto pt-14">
        <PricingPage />
      </div>
    </RouteModal>
  );
}
