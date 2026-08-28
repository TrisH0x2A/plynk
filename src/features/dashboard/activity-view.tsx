import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ActivityIcon } from "lucide-react";
import { tauriApi } from "@/lib/tauri";
import { AuditLog } from "@/types";
import { ActivityItem } from "@/components/activity-item";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityViewProps {
  workspaceId: string;
}

export const ActivityView = ({ workspaceId }: ActivityViewProps) => {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["workspace-logs", workspaceId],
    queryFn: () => tauriApi.getAuditLogsByWorkspace(workspaceId),
    enabled: !!workspaceId,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="font-sans text-4xl font-bold text-white tracking-tighter mb-2">
          Activity Log
        </h2>
        <p className="font-sans text-sm text-[#c4c7c8]">
          Chronological record of system events, structural changes, and administrative actions.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full bg-[#09090B] border border-[#27272A]" />
          <Skeleton className="h-24 w-full bg-[#09090B] border border-[#27272A]" />
        </div>
      ) : auditLogs && auditLogs.length > 0 ? (
        <div className="relative space-y-6 pt-4">
          {auditLogs.map((log: AuditLog) => (
            <ActivityItem key={log.id} data={log} />
          ))}
        </div>
      ) : (
        <div className="p-8 bg-[#09090B] border border-[#27272A] text-center font-mono text-xs text-[#656467] uppercase tracking-wider">
          No activity recorded yet for this workspace.
        </div>
      )}
    </div>
  );
};
