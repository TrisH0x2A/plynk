import React, { useState } from "react";
import { toast } from "sonner";
import { Tag, Plus, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { getLabelColor } from "@/features/board/card-item";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface LabelPickerProps {
  data: Card;
  boardId: string;
}

const PRESET_LABELS = [
  "URGENT",
  "HIGH PRIORITY",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "BUG",
  "FEATURE",
  "DEVOPS",
];

export const LabelPicker = ({ data, boardId }: LabelPickerProps) => {
  const queryClient = useQueryClient();
  const [customTag, setCustomTag] = useState("");

  let currentLabels: string[] = [];
  try {
    if (data.labels) {
      currentLabels = JSON.parse(data.labels);
    }
  } catch (e) {
    if (data.labels) {
      currentLabels = data.labels.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const updateLabels = async (newLabels: string[]) => {
    try {
      await tauriApi.updateCard(data.id, undefined, undefined, undefined, JSON.stringify(newLabels));
      queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
    } catch (error) {
      toast.error(String(error));
    }
  };

  const toggleLabel = (label: string) => {
    const exists = currentLabels.includes(label);
    const updated = exists
      ? currentLabels.filter((l) => l !== label)
      : [...currentLabels, label];
    updateLabels(updated);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTag.trim().toUpperCase();
    if (!trimmed) return;

    if (!currentLabels.includes(trimmed)) {
      updateLabels([...currentLabels, trimmed]);
    }
    setCustomTag("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-semibold text-[#09090B] dark:text-white uppercase tracking-wider flex items-center gap-x-2">
          <Tag className="h-4 w-4 text-[#09090B] dark:text-white" />
          <span>Labels</span>
        </p>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="text-[#656467] hover:text-white transition-colors p-1 flex items-center gap-x-1 font-mono text-[10px] uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Label</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-64 bg-[#09090B] border border-[#27272A] text-white rounded-none p-4 shadow-2xl z-[100] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <span className="font-mono text-xs font-semibold text-[#656467] uppercase">
                Select Labels
              </span>
              <PopoverClose asChild>
                <button
                  type="button"
                  className="text-[#656467] hover:text-white transition-colors p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </PopoverClose>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
              {PRESET_LABELS.map((lbl) => {
                const isActive = currentLabels.includes(lbl);
                return (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => toggleLabel(lbl)}
                    className={`px-2.5 py-1 border font-mono text-[10px] uppercase tracking-wider font-semibold transition-all ${
                      isActive
                        ? "bg-white text-black border-white"
                        : `bg-[#131315] ${getLabelColor(lbl)} hover:border-white`
                    }`}
                  >
                    {lbl} {isActive && "✓"}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleAddCustom} className="pt-2 border-t border-[#27272A] space-y-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="CUSTOM TAG..."
                className="text-xs font-mono bg-[#131315] border-[#27272A] text-white px-2.5 py-1 h-8 rounded-none uppercase"
              />
              <button
                type="submit"
                className="w-full bg-white text-black font-mono text-xs uppercase py-1.5 font-semibold hover:bg-[#353437] hover:text-white transition-colors"
              >
                Add Custom Label
              </button>
            </form>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Labels List */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
        {currentLabels.length === 0 ? (
          <span className="font-mono text-[10px] text-[#656467] uppercase">
            No labels attached
          </span>
        ) : (
          currentLabels.map((lbl, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 border font-mono text-[10px] uppercase tracking-wider font-semibold flex items-center gap-x-1.5 ${getLabelColor(lbl)}`}
            >
              <span>{lbl}</span>
              <button
                type="button"
                onClick={() => toggleLabel(lbl)}
                className="hover:text-white transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))
        )}
      </div>
    </div>
  );
};
