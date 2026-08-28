import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, CheckCircle2, Clock, Flame } from "lucide-react";
import { Card, CardStatus } from "@/types";
import { useCardModal } from "@/stores/use-card-modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CardItemProps {
  data: Card;
  index: number;
}

export const getLabelColor = (labelName: string) => {
  const upper = labelName.toUpperCase();
  if (upper.includes("URGENT") || upper.includes("HIGH")) {
    return "dark:bg-rose-500/10 bg-rose-100 dark:text-rose-400 text-rose-800 dark:border-rose-500/30 border-rose-400 font-bold";
  }
  if (upper.includes("BACKEND") || upper.includes("SERVER")) {
    return "dark:bg-purple-500/10 bg-purple-100 dark:text-purple-400 text-purple-800 dark:border-purple-500/30 border-purple-400 font-bold";
  }
  if (upper.includes("FRONTEND") || upper.includes("UI")) {
    return "dark:bg-blue-500/10 bg-blue-100 dark:text-blue-400 text-blue-800 dark:border-blue-500/30 border-blue-400 font-bold";
  }
  if (upper.includes("SECURITY") || upper.includes("AUTH")) {
    return "dark:bg-indigo-500/10 bg-indigo-100 dark:text-indigo-400 text-indigo-800 dark:border-indigo-500/30 border-indigo-400 font-bold";
  }
  if (upper.includes("BUG") || upper.includes("FIX")) {
    return "dark:bg-amber-500/10 bg-amber-100 dark:text-amber-400 text-amber-900 dark:border-amber-500/30 border-amber-400 font-bold";
  }
  if (upper.includes("FEATURE") || upper.includes("STORY")) {
    return "dark:bg-emerald-500/10 bg-emerald-100 dark:text-emerald-400 text-emerald-800 dark:border-emerald-500/30 border-emerald-400 font-bold";
  }
  return "dark:bg-zinc-500/10 bg-zinc-200 dark:text-zinc-300 text-zinc-900 dark:border-zinc-500/30 border-zinc-400 font-bold";
};

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();
  const formattedId = `TSK-${(index + 101).toString().padStart(3, "0")}`;

  const status: CardStatus = (data.status as CardStatus) || "ACTIVE";
  
  let parsedLabels: string[] = [];
  try {
    if (data.labels) {
      parsedLabels = JSON.parse(data.labels);
    }
  } catch (e) {
    if (data.labels) {
      parsedLabels = data.labels.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  const isCompleted = status === "COMPLETED";
  const isPostponed = status === "POSTPONED";
  const isInProgress = status === "IN_PROGRESS";

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 12,
          }}
          className={`bg-white dark:bg-[#000000] border p-4 cursor-pointer group relative overflow-hidden select-none ${
            snapshot.isDragging
              ? "border-black dark:border-white ring-1 ring-black/50 dark:ring-white/50 shadow-2xl z-50 opacity-95"
              : ""
          } ${
            isCompleted
              ? "border-emerald-500/40 hover:border-emerald-500 dark:bg-emerald-950/10 bg-emerald-50/50"
              : isPostponed
              ? "border-amber-500/40 hover:border-amber-500 dark:bg-amber-950/10 bg-amber-50/50"
              : isInProgress
              ? "border-cyan-500/40 hover:border-cyan-500 dark:bg-cyan-950/10 bg-cyan-50/50"
              : "border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA]"
          }`}
        >
          {/* Accent Line */}
          <div
            className={`absolute left-0 top-0 bottom-0 w-[3px] ${
              isCompleted
                ? "bg-emerald-500"
                : isPostponed
                ? "bg-amber-500"
                : isInProgress
                ? "bg-cyan-500"
                : "bg-[#E4E4E7] dark:bg-[#27272A] group-hover:bg-black dark:group-hover:bg-white"
            }`}
          />
          
          {/* Top Row: Task ID + Status Badge */}
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-mono text-[11px] text-[#71717A] dark:text-[#656467] uppercase tracking-wider font-semibold">
              {formattedId}
            </span>

            {isCompleted && (
              <span className="px-2 py-0.5 border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono text-[10px] uppercase font-bold flex items-center gap-x-1">
                <CheckCircle2 className="h-3 w-3" /> DONE
              </span>
            )}
            {isPostponed && (
              <span className="px-2 py-0.5 border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-400 font-mono text-[10px] uppercase font-bold flex items-center gap-x-1">
                <Clock className="h-3 w-3" /> POSTPONED
              </span>
            )}
            {isInProgress && (
              <span className="px-2 py-0.5 border border-cyan-300 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-400 font-mono text-[10px] uppercase font-bold flex items-center gap-x-1">
                <Flame className="h-3 w-3" /> IN PROGRESS
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className={`font-sans text-base font-semibold text-[#09090B] dark:text-white mb-2 leading-snug ${
            isCompleted ? "line-through opacity-60" : isPostponed ? "opacity-75" : ""
          }`}>
            {data.title}
          </h3>

          {/* Description Snippet */}
          {data.description && (
            <p className="font-sans text-xs text-[#52525B] dark:text-[#c4c7c8] line-clamp-2 mb-3">
              {data.description}
            </p>
          )}

          {/* Labels Row */}
          {parsedLabels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {parsedLabels.map((lbl, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 border font-mono text-[10px] uppercase tracking-wider font-semibold ${getLabelColor(lbl)}`}
                >
                  {lbl}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-[#E4E4E7] dark:border-[#27272A]/50">
            <div className="flex items-center gap-x-1.5 text-[#71717A] dark:text-[#656467]">
              <Calendar className="h-3.5 w-3.5" />
              <span className="font-mono text-[10px] uppercase">LOCAL</span>
            </div>

            <Avatar className="h-5 w-5 border border-[#E4E4E7] dark:border-[#27272A] rounded-none">
              <AvatarFallback className="bg-black text-white dark:bg-[#353437] dark:text-white font-mono text-[10px] rounded-none font-bold">
                {(() => {
                  const stored = typeof window !== "undefined" ? localStorage.getItem("plynk_user_name") : null;
                  return (stored && stored.trim()) ? stored.charAt(0).toUpperCase() : "S";
                })()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
    </Draggable>
  );
};
