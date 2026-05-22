import { notFound } from "next/navigation";
import { TRAINERS } from "@/lib/data";
import { TrainerProfilePreview } from "@/components/discover/trainer-profile-preview";
import { RouteModal } from "@/components/shell/route-modal";

export default function TrainerProfileModalPage({
  params
}: {
  params: { id: string };
}) {
  const trainer = TRAINERS.find((t) => t.id === params.id);
  if (!trainer) return notFound();

  return (
    <RouteModal title={trainer.name} size="sheet">
      <TrainerProfilePreview trainer={trainer} />
    </RouteModal>
  );
}
