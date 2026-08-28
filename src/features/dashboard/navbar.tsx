import { Plus } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { FormPopover } from "@/components/form/form-popover";
import { MobileSidebar } from "./mobile-sidebar";
import { Sidebar } from "./sidebar";
import { Workspace } from "@/types";

interface NavbarProps {
  userName?: string;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeView: string;
  onSelectWorkspace: (id: string) => void;
  onSelectView: (view: string) => void;
  onCreateWorkspace: () => void;
  onBoardCreated: (boardId: string) => void;
  onLogoClick: () => void;
}

export const Navbar = ({
  userName,
  workspaces,
  activeWorkspaceId,
  activeView,
  onSelectWorkspace,
  onSelectView,
  onCreateWorkspace,
  onBoardCreated,
  onLogoClick,
}: NavbarProps) => {
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <nav className="fixed z-50 top-0 px-4 w-full h-14 border-b shadow-sm bg-white flex items-center">
      <MobileSidebar>
        <Sidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeView={activeView}
          onSelectWorkspace={onSelectWorkspace}
          onSelectView={onSelectView}
          onCreateWorkspace={onCreateWorkspace}
        />
      </MobileSidebar>
      <div className="flex items-center gap-x-4">
        <Logo onClick={onLogoClick} />
        {activeWorkspaceId && (
          <>
            <FormPopover
              workspaceId={activeWorkspaceId}
              onBoardCreated={onBoardCreated}
              align="start"
              side="bottom"
              sideOffset={18}
            >
              <Button
                variant="primary"
                size="sm"
                className="rounded-sm hidden md:block h-auto py-1.5 px-2"
              >
                Create
              </Button>
            </FormPopover>
            <FormPopover
              workspaceId={activeWorkspaceId}
              onBoardCreated={onBoardCreated}
            >
              <Button
                variant="primary"
                size="sm"
                className="rounded-sm block md:hidden"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </FormPopover>
          </>
        )}
      </div>
      <div className="ml-auto flex items-center gap-x-3">
        {userName && (
          <div className="flex items-center gap-x-2 px-2.5 py-1 bg-slate-100/80 rounded-full border border-slate-200 text-xs text-neutral-800 font-semibold shadow-xs">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-indigo-600 text-white font-bold text-[10px]">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span>{userName}</span>
          </div>
        )}
        <div className="hidden sm:flex items-center gap-x-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200 text-xs text-emerald-700 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Offline
        </div>
      </div>
    </nav>
  );
};
