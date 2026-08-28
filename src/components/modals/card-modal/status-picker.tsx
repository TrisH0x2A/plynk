import React from "react";
import { toast } from "sonner";
import { CheckCircle2, Clock, Flame, Circle, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardStatus } from "@/types";
import { tauriApi } from "@/lib/tauri";

interface StatusPickerProps {
  data: Card;
  boardId: string;
}

export const StatusPicker = ({ data, boardId }: StatusPickerProps) => {
  const queryClient = useQueryClient();
  const currentStatus: CardStatus = (data.status as CardStatus) || "ACTIVE";

  const handleStatusChange = async (newStatus: CardStatus) => {
    if (newStatus === currentStatus) return;

    try {
      await tauriApi.updateCard(data.id, undefined, undefined, newStatus, undefined);
      queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`Card status changed to ${newStatus}`);
    } catch (error) {
      toast.error(String(error));
    }
  };

  const statusOptions: { id: CardStatus; label: string; icon: any; activeClass: string; textClass: string }[] = [
    {
      id: "ACTIVE",
      label: "ACTIVE",
      icon: Circle,
      activeClass: "bg-black dark:bg-white text-white dark:text-black font-bold border-black dark:border-white shadow-sm",
      textClass: "text-[#09090B] dark:text-[#656467] bg-zinc-100 dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] hover:bg-zinc-200 dark:hover:bg-[#18181B] hover:text-black dark:hover:text-white font-bold",
    },
    {
      id: "IN_PROGRESS",
      label: "IN PROGRESS",
      icon: Flame,
      activeClass: "bg-cyan-700 dark:bg-cyan-500 text-white dark:text-black font-bold border-cyan-800 dark:border-cyan-400 shadow-sm",
      textClass: "text-cyan-800 dark:text-cyan-400 bg-cyan-50 dark:bg-[#131315] border-cyan-300 dark:border-[#27272A] hover:bg-cyan-100 dark:hover:bg-cyan-950/30 font-bold",
    },
    {
      id: "COMPLETED",
      label: "COMPLETED",
      icon: CheckCircle2,
      activeClass: "bg-emerald-700 dark:bg-emerald-500 text-white dark:text-black font-bold border-emerald-800 dark:border-emerald-400 shadow-sm",
      textClass: "text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-[#131315] border-emerald-300 dark:border-[#27272A] hover:bg-emerald-100 dark:hover:bg-emerald-950/30 font-bold",
    },
    {
      id: "POSTPONED",
      label: "POSTPONED",
      icon: Clock,
      activeClass: "bg-amber-600 dark:bg-amber-500 text-white dark:text-black font-bold border-amber-700 dark:border-amber-400 shadow-sm",
      textClass: "text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-[#131315] border-amber-300 dark:border-[#27272A] hover:bg-amber-100 dark:hover:bg-amber-950/30 font-bold",
    },
  ];

  return (
    <div className="space-y-2">
      <p className="font-mono text-xs font-semibold text-[#09090B] dark:text-white uppercase tracking-wider mb-2 flex items-center gap-x-2">
        <ShieldAlert className="h-4 w-4 text-[#09090B] dark:text-white" />
        <span>Card Status</span>
      </p>

      <div className="grid grid-cols-2 gap-2">
        {statusOptions.map((opt) => {
          const Icon = opt.icon;
          const isSelected = currentStatus === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleStatusChange(opt.id)}
              className={`flex items-center justify-center gap-x-2 py-2 px-3 border font-mono text-xs uppercase tracking-wider transition-all duration-150 rounded-none cursor-pointer ${
                isSelected ? opt.activeClass : opt.textClass
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
