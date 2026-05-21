"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Save, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n-provider";

type ProgramBlock = {
  id: string;
  name: string;
  durationMin: number;
  intensity: "low" | "moderate" | "high";
};

const INITIAL_BLOCKS: ProgramBlock[] = [
  { id: "pb1", name: "Warm-up mobility", durationMin: 15, intensity: "low" },
  { id: "pb2", name: "Threshold intervals", durationMin: 45, intensity: "high" },
  { id: "pb3", name: "Core stability", durationMin: 20, intensity: "moderate" },
  { id: "pb4", name: "Cool-down stretch", durationMin: 10, intensity: "low" }
];

const INTENSITY_STYLES: Record<ProgramBlock["intensity"], string> = {
  low: "bg-lime-500/15 text-lime-400",
  moderate: "bg-brand-400/15 text-brand-400",
  high: "bg-signal-500/15 text-signal-500"
};

function SortableBlock({ block }: { block: ProgramBlock }) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-ink-700/80 bg-ink-800/40 px-3 py-2.5 ${
        isDragging ? "opacity-60 shadow-lg ring-1 ring-lime-500/30" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-ink-600 active:cursor-grabbing"
        aria-label={t("coachDashboard", "dragBlock")}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-100">{block.name}</p>
        <p className="text-[10px] text-ink-500">
          {block.durationMin}
          {t("coachDashboard", "minutesShort")}
        </p>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${INTENSITY_STYLES[block.intensity]}`}
      >
        {block.intensity}
      </span>
    </div>
  );
}

export function ProgramBuilderPanel() {
  const t = useT();
  const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const blockIds = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setBlocks((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-ink-100">
            {t("coachDashboard", "programBuilderTitle")}
          </h3>
          <p className="mt-0.5 text-xs text-ink-500">
            {t("coachDashboard", "programBuilderSubtitle")}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleSave}
            className={`gap-1.5 border-ink-700 text-xs ${
              saved ? "border-lime-500/40 text-lime-400" : "text-ink-400"
            }`}
          >
            <Save className="h-3.5 w-3.5" />
            {saved ? t("coachDashboard", "saved") : t("coachDashboard", "saveDraft")}
          </Button>
          <Button
            size="sm"
            type="button"
            className="gap-1.5 bg-gradient-to-r from-brand-500 to-lime-500 text-xs font-bold text-ink-950"
          >
            <Send className="h-3.5 w-3.5" />
            {t("coachDashboard", "publishProgram")}
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {blocks.map((block) => (
              <SortableBlock key={block.id} block={block} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-ink-700 py-3 text-xs text-ink-500 transition-colors hover:border-ink-600 hover:bg-ink-800/30 hover:text-ink-300"
      >
        <Plus className="h-3.5 w-3.5" />
        {t("coachDashboard", "addBlock")}
      </button>
    </div>
  );
}
