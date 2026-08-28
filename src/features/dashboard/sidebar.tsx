import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Plus, LayoutGrid, Activity, Settings, Database, Layers, Trash2, Moon, Sun, Github, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { APP_LINKS, fetchGitHubStars } from "@/constants/links";
import { tauriApi } from "@/lib/tauri";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Workspace } from "@/types";

interface SidebarProps {
  userName?: string;
  theme?: "dark" | "light";
  onToggleTheme?: (theme: "dark" | "light") => void;
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
  const [starCount, setStarCount] = useState<string>("...");

  const { data: binItems = [] } = useQuery({
    queryKey: ["recycle-bin"],
    queryFn: () => tauriApi.getRecycleBin(),
  });

  useEffect(() => {
    fetchGitHubStars(APP_LINKS.GITHUB_REPO).then((stars) => {
      setStarCount(stars);
    });
  }, []);

  const handleOpenGithub = async () => {
    await tauriApi.openExternalUrl(APP_LINKS.GITHUB_REPO);
  };

  const navItems = [
    { id: "boards", label: "BOARDS", icon: LayoutGrid },
    { id: "activity", label: "ACTIVITY", icon: Activity },
    { id: "settings", label: "WORKSPACE", icon: Layers },
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
        {/* Single Combined Row: [Theme Switcher] | [Github Icon | Counter | Star Icon] */}
        <div className="flex items-center gap-x-1.5 w-full">
          {/* Animated Smooth Theme Switcher */}
          <button
            type="button"
            onClick={() => onToggleTheme?.(theme === "dark" ? "light" : "dark")}
            className="relative w-14 h-8 bg-[#F4F4F5] dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] p-0.5 flex items-center cursor-pointer select-none shrink-0 group rounded-none"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode (Ctrl+T)`}
          >
            {/* Background Track Icons */}
            <div className="w-full flex items-center justify-between px-1 text-[#71717A] dark:text-[#656467]">
              <Moon className="h-2.5 w-2.5" />
              <Sun className="h-2.5 w-2.5" />
            </div>

            {/* Sliding Smooth Thumb */}
            <div
              className={`absolute top-0.5 bottom-0.5 w-[24px] bg-black text-white dark:bg-white dark:text-black shadow-sm transition-transform duration-300 ease-out flex items-center justify-center rounded-none ${
                theme === "light" ? "translate-x-[26px]" : "translate-x-0"
              }`}
            >
              {theme === "dark" ? (
                <Moon className="h-3 w-3 fill-current" />
              ) : (
                <Sun className="h-3 w-3 fill-current" />
              )}
            </div>
          </button>

          {/* Animated Settings Icon Button */}
          <button
            type="button"
            onClick={() => onSelectView("app-settings")}
            className={`h-8 w-8 flex items-center justify-center bg-white dark:bg-[#09090B] border ${
              activeView === "app-settings"
                ? "border-black dark:border-white text-black dark:text-white font-bold shadow-sm"
                : "border-[#E4E4E7] dark:border-[#27272A] text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-[#A1A1AA] hover:text-black dark:hover:text-white"
            } hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all rounded-none cursor-pointer group shrink-0 select-none`}
            title="Application Settings (Ctrl+,)"
          >
            <Settings className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Recycle Bin Button */}
          <button
            type="button"
            onClick={() => onSelectView("bin")}
            className={`relative h-8 w-8 flex items-center justify-center bg-white dark:bg-[#09090B] border ${
              activeView === "bin"
                ? "border-black dark:border-white text-black dark:text-white font-bold shadow-sm"
                : "border-[#E4E4E7] dark:border-[#27272A] text-zinc-600 dark:text-zinc-400 hover:border-black dark:hover:border-[#A1A1AA] hover:text-black dark:hover:text-white"
            } hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all rounded-none cursor-pointer group shrink-0 select-none`}
            title="Recycle Bin // Recovery & Archival"
          >
            <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform duration-200" />
            {binItems && binItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 px-1 min-w-[14px] h-[14px] bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-black">
                {binItems.length > 9 ? "9+" : binItems.length}
              </span>
            )}
          </button>

          {/* GitHub Star & Support Button: [github icon | counter | star icon] */}
          <button
            type="button"
            onClick={handleOpenGithub}
            className="flex-1 h-8 flex items-center justify-between px-2.5 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA] hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-all rounded-none cursor-pointer group select-none"
            title="Support Plynk on GitHub"
          >
            <Github className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0" />
            <span className="font-mono text-xs font-bold text-[#09090B] dark:text-white">
              {starCount}
            </span>
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform shrink-0" />
          </button>
        </div>

        {/* User Card */}
        <div onClick={() => onSelectView("app-settings")} className="flex items-center gap-x-3 p-2 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA] transition-colors rounded-none cursor-pointer">
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
