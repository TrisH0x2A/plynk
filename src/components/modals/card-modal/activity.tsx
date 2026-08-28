import { Activity as ActivityIcon } from "lucide-react";
import { AuditLog } from "@/types";
import { ActivityItem } from "@/components/activity-item";

interface ActivityProps {
  items: AuditLog[];
}

export const Activity = ({ items }: ActivityProps) => {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <ActivityIcon className="h-5 w-5 mt-0.5 text-white shrink-0" />
      <div className="w-full">
        <p className="font-mono text-xs font-semibold text-white uppercase tracking-wider mb-3">
          Activity
        </p>
        <ol className="mt-2 space-y-3">
          {items.map((item) => (
            <ActivityItem key={item.id} data={item} />
          ))}
        </ol>
      </div>
    </div>
  );
};
