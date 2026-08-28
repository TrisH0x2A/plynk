import React from "react";
import { format } from "date-fns";
import {
  CheckCircle2,
  Clock,
  Flame,
  Tag,
  Plus,
  Trash2,
  Edit3,
  FileText,
  GitCommit,
} from "lucide-react";
import { AuditLog } from "@/types";
import { getLogDetails } from "@/lib/generate-log-message";

interface ActivityItemProps {
  data: AuditLog;
}

export const ActivityItem = ({ data }: ActivityItemProps) => {
  const formattedTime = format(new Date(data.created_at), "hh:mm a");
  const logId = `ID: ${data.id.substring(0, 6).toUpperCase()}`;
  const { actionTitle, description, badgeType } = getLogDetails(data);

  // Active user name: prioritize custom user name if set
  const storedName = typeof window !== "undefined" ? localStorage.getItem("plynk_user_name") : null;
  const activeCustomName = (storedName && storedName.trim()) ? storedName.trim() : null;

  const displayName = activeCustomName
    ? activeCustomName
    : (data.user_name && data.user_name !== "Local User")
    ? data.user_name
    : "SYS_ADMIN";

  const renderIconAndStyle = () => {
    switch (badgeType) {
      case "completed":
        return {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />,
          containerBorder: "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-emerald-500/20 hover:border-emerald-500",
          badgeColor: "text-emerald-700 dark:text-emerald-400",
        };
      case "in_progress":
        return {
          icon: <Flame className="h-4 w-4 text-cyan-700 dark:text-cyan-400" />,
          containerBorder: "border-cyan-300 dark:border-cyan-500/40 bg-cyan-50 dark:bg-cyan-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-cyan-500/20 hover:border-cyan-500",
          badgeColor: "text-cyan-800 dark:text-cyan-400",
        };
      case "postponed":
        return {
          icon: <Clock className="h-4 w-4 text-amber-700 dark:text-amber-400" />,
          containerBorder: "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-amber-500/20 hover:border-amber-500",
          badgeColor: "text-amber-800 dark:text-amber-400",
        };
      case "labels":
        return {
          icon: <Tag className="h-4 w-4 text-purple-700 dark:text-purple-400" />,
          containerBorder: "border-purple-300 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-purple-500/20 hover:border-purple-500",
          badgeColor: "text-purple-700 dark:text-purple-400",
        };
      case "created":
        return {
          icon: <Plus className="h-4 w-4 text-black dark:text-white stroke-[2.5]" />,
          containerBorder: "border-zinc-300 dark:border-white/40 bg-zinc-100 dark:bg-white/10",
          cardBorder: "border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-white/50",
          badgeColor: "text-black dark:text-white",
        };
      case "deleted":
        return {
          icon: <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />,
          containerBorder: "border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-rose-500/20 hover:border-rose-500",
          badgeColor: "text-rose-700 dark:text-rose-400",
        };
      case "renamed":
        return {
          icon: <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />,
          containerBorder: "border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/20",
          cardBorder: "border-[#E4E4E7] dark:border-[#27272A] hover:border-blue-500",
          badgeColor: "text-blue-700 dark:text-blue-400",
        };
      case "updated":
        return {
          icon: <FileText className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />,
          containerBorder: "border-zinc-300 dark:border-zinc-500/40 bg-zinc-100 dark:bg-zinc-900/30",
          cardBorder: "border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA]",
          badgeColor: "text-zinc-800 dark:text-zinc-300",
        };
      default:
        return {
          icon: <GitCommit className="h-4 w-4 text-black dark:text-white" />,
          containerBorder: "border-[#E4E4E7] dark:border-[#27272A] bg-white dark:bg-[#09090B]",
          cardBorder: "border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA]",
          badgeColor: "text-black dark:text-white",
        };
    }
  };

  const style = renderIconAndStyle();

  return (
    <div className="activity-item relative flex gap-6 group">
      {/* Exact Timeline Connector: Placed at center of 48px box (x = 24px) */}
      <div className="absolute left-0 top-[48px] -bottom-[24px] w-px bg-[#D4D4D8] dark:bg-[#27272A] group-last:hidden pointer-events-none z-0" />

      {/* Icon Node Box */}
      <div
        className={`shrink-0 w-12 h-12 rounded-none border flex items-center justify-center transition-colors duration-200 relative z-10 ${style.containerBorder}`}
      >
        {style.icon}
      </div>

      {/* Activity Card Body */}
      <div
        className={`flex-1 bg-white dark:bg-[#09090B] border p-6 rounded-none transition-colors duration-200 ${style.cardBorder}`}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-mono text-xs uppercase font-bold tracking-wider ${style.badgeColor}`}>
            {actionTitle}
          </h3>
          <span className="font-mono text-xs text-[#71717A] dark:text-[#656467]">
            {formattedTime}
          </span>
        </div>

        <p className="font-sans text-sm text-[#52525B] dark:text-[#c4c7c8] mb-4 leading-relaxed">
          <span className="font-bold text-black dark:text-white uppercase mr-1.5 font-mono text-xs">
            {displayName}
          </span>
          <span>{description}</span>
        </p>

        <div className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase tracking-widest">
          {logId}
        </div>
      </div>
    </div>
  );
};
