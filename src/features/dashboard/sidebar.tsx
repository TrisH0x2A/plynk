import React from "react";
import { Sparkles, Plus, LayoutGrid, Activity, Settings, Database, Layers, Trash2, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Workspace } from "@/types";

interface SidebarProps {
  userName?: string;
  theme?: "dark" | "light";
  onToggleTheme?: (theme: "dark" | "light") => void;
  onOpenOnboarding?: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeView: string;
  isLoading?: boolean;
  onSelectWorkspace: (id: string) => void;
  onSelectView: (view: string) => void;
  onCreateWorkspace: () => void;
  onDeleteWorkspace?: (id: string, name: string) => void;
}

export const Sidebar = ({
  userName = "SYS_ADMIN",
  theme = "dark",
  onToggleTheme,
  onOpenOnboarding,
  workspaces,
  activeWorkspaceId,
  activeView,
  isLoading = false,
  onSelectWorkspace,
  onSelectView,
  onCreateWorkspace,
  onDeleteWorkspace,
}: SidebarProps) => {
  const initial = userName ? userName.charAt(0).toUpperCase() : "S";

  const navItems = [
    { id: "boards", label: "BOARDS", icon: LayoutGrid },
    { id: "activity", label: "ACTIVITY", icon: Activity },
    { id: "settings", label: "SETTINGS", icon: Settings },
    { id: "backup", label: "BACKUP", icon: Database },
  ];

  return (
    <aside className="w-64 h-full bg-[#FAFAFA] dark:bg-[#131315] border-r border-[#E4E4E7] dark:border-[#27272A] flex flex-col py-6 select-none shrink-0 transition-colors duration-200">
      {/* Brand Header */}
      <div className="px-6 mb-8">
        <div className="flex items-center gap-x-2">
          <img src={theme === "light" ? "/logo-light.png" : "/logo.png"} alt="Plynk" className="w-6 h-6 object-contain" />
          <h1 className="font-bold text-xl tracking-tighter text-[#09090B] dark:text-white font-sans">
            PLYNK
          </h1>
        </div>
        <p className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase tracking-widest mt-1">
          PREMIUM ACCESS
        </p>
      </div>

      {/* Main Navigation View Switcher */}
      <div className="mb-6">
        <div className="px-6 mb-2 text-[10px] font-mono text-[#71717A] dark:text-[#656467] uppercase tracking-wider font-semibold">
          NAVIGATION
        </div>
        <ul className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectView(item.id)}
                  className={`w-full flex items-center gap-x-3 py-2.5 pl-6 pr-4 transition-all duration-150 font-mono text-xs uppercase tracking-wider text-left ${
                    isActive
                      ? "text-black dark:text-white border-l-2 border-black dark:border-white bg-[#E4E4E7] dark:bg-[#353437] font-bold"
                      : "text-[#71717A] dark:text-[#656467] hover:bg-[#E4E4E7] dark:hover:bg-[#2a2a2c] hover:text-black dark:hover:text-white border-l-2 border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Workspaces Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 mb-2 flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#71717A] dark:text-[#656467] uppercase tracking-wider font-semibold">
            WORKSPACES
          </span>
          <button
            onClick={onCreateWorkspace}
            type="button"
            className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors p-1"
            title="Create Workspace"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <ul className="flex flex-col space-y-1">
          {workspaces.map((ws) => {
            const isSelected = activeWorkspaceId === ws.id;
            return (
              <li key={ws.id} className="group relative px-2">
                <div
                  onClick={() => onSelectWorkspace(ws.id)}
                  className={`w-full flex items-center justify-between py-2 pl-4 pr-2 transition-all duration-150 font-mono text-xs uppercase tracking-wider cursor-pointer ${
                    isSelected
                      ? "text-black dark:text-white bg-[#E4E4E7] dark:bg-[#201f22] font-semibold"
                      : "text-[#71717A] dark:text-[#656467] hover:bg-[#E4E4E7] dark:hover:bg-[#2a2a2c] hover:text-black dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-x-2.5 truncate flex-1 mr-2">
                    <Layers className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span className="truncate">{ws.name}</span>
                  </div>

                  {workspaces.length > 1 && onDeleteWorkspace && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWorkspace(ws.id, ws.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#71717A] hover:text-rose-500 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-[#131315] transition-all"
                      title="Delete Workspace"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Section: Theme Toggler & User Profile */}
      <div className="px-6 mt-auto border-t border-[#E4E4E7] dark:border-[#27272A] pt-4 space-y-3">
        {/* Monochrome Theme Toggler */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#71717A] dark:text-[#656467] uppercase tracking-wider font-semibold">
              APPEARANCE
            </span>
          </div>

          <div className="flex items-center p-0.5 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]">
            <button
              type="button"
              onClick={() => onToggleTheme?.("dark")}
              className={`flex-1 flex items-center justify-center gap-x-1.5 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                theme === "dark"
                  ? "bg-white text-black shadow-sm"
                  : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white"
              }`}
            >
              <Moon className="h-3 w-3" />
              <span>DARK</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleTheme?.("light")}
              className={`flex-1 flex items-center justify-center gap-x-1.5 py-1.5 font-mono text-[10px] uppercase font-bold tracking-wider transition-all duration-150 ${
                theme === "light"
                  ? "bg-black text-white shadow-sm"
                  : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white"
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>LIGHT</span>
            </button>
          </div>
        </div>

        {/* Dev Onboarding Trigger Button */}
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="w-full flex items-center justify-center gap-x-2 py-2 px-3 bg-zinc-100 dark:bg-[#18181B] border border-dashed border-[#A1A1AA] dark:border-[#3F3F46] hover:border-black dark:hover:border-white text-[#09090B] dark:text-white font-mono text-[10px] uppercase font-bold tracking-wider transition-colors rounded-none cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          <span>PREVIEW ONBOARDING</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-x-3 p-2 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA] transition-colors rounded-none cursor-pointer">
          <Avatar className="h-7 w-7 rounded-none border border-[#E4E4E7] dark:border-[#27272A]">
            <AvatarFallback className="bg-black text-white dark:bg-[#353437] dark:text-white font-mono text-xs uppercase rounded-none font-bold">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="truncate">
            <p className="font-mono text-xs text-[#09090B] dark:text-white uppercase truncate font-semibold">
              {userName}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
