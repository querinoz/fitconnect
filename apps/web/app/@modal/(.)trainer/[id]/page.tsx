import { notFound } from "next/navigation";
import { TRAINERS } from "@/lib/data";
import { TrainerProfilePreview } from "@/components/discover/trainer-profile-preview";
import { RouteModal } from "@/components/shell/route-modal";

export default async function TrainerProfileModalPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trainer = TRAINERS.find((t) => t.id === id);
  if (!trainer) return notFound();

  return (
    <RouteModal title={trainer.name} size="sheet">
      <TrainerProfilePreview trainer={trainer} />
    </RouteModal>
  );
}
