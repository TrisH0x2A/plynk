import { Layout, Activity, Settings, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Workspace } from "@/types";

interface NavItemProps {
  isExpanded: boolean;
  isActive: boolean;
  workspace: Workspace;
  activeView: string;
  onExpand: (id: string) => void;
  onSelectView: (view: string) => void;
}

export const NavItem = ({
  isExpanded,
  isActive,
  workspace,
  activeView,
  onExpand,
  onSelectView,
}: NavItemProps) => {
  const routes = [
    {
      id: "boards",
      label: "Boards",
      icon: <Layout className="h-4 w-4 mr-2" />,
    },
    {
      id: "activity",
      label: "Activity",
      icon: <Activity className="h-4 w-4 mr-2" />,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    {
      id: "backup",
      label: "Backup & Restore",
      icon: <Database className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <AccordionItem value={workspace.id} className="border-none">
      <AccordionTrigger
        onClick={() => onExpand(workspace.id)}
        className={cn(
          "flex items-center gap-x-2 p-1.5 text-neutral-700 rounded-md hover:bg-neutral-500/10 transition text-start no-underline hover:no-underline",
          isActive && !isExpanded && "bg-sky-500/10 text-sky-700"
        )}
      >
        <div className="flex items-center gap-x-2">
          <div className="w-7 h-7 rounded-sm bg-sky-700 text-white font-bold flex items-center justify-center text-xs">
            {workspace.name.substring(0, 1).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{workspace.name}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-1 text-neutral-700">
        {routes.map((route) => (
          <Button
            key={route.id}
            size="sm"
            onClick={() => onSelectView(route.id)}
            className={cn(
              "w-full font-normal justify-start pl-10 mb-1",
              activeView === route.id && "bg-sky-500/10 text-sky-700 font-semibold"
            )}
            variant="ghost"
          >
            {route.icon}
            {route.label}
          </Button>
        ))}
      </AccordionContent>
    </AccordionItem>
  );
};

NavItem.Skeleton = function SkeletonNavItem() {
  return (
    <div className="flex items-center gap-x-2">
      <div className="w-10 h-10 relative shrink-0">
        <Skeleton className="h-full w-full absolute" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
};
