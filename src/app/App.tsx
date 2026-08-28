import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";

import { tauriApi } from "@/lib/tauri";
import { Workspace } from "@/types";
import { Sidebar } from "@/features/dashboard/sidebar";
import { BoardList } from "@/features/dashboard/board-list";
import { ActivityView } from "@/features/dashboard/activity-view";
import { SettingsView } from "@/features/dashboard/settings-view";
import { AppSettingsView } from "@/features/dashboard/app-settings-view";
import { BackupView } from "@/features/dashboard/backup-view";
import { BoardNavbar } from "@/features/board/board-navbar";
import { ListContainer } from "@/features/board/list-container";
import { ModalProvider } from "@/components/providers/modal-provider";
import { OnboardingModal } from "@/components/modals/onboarding-modal";
import { WorkspaceModal } from "@/components/modals/workspace-modal";

export const App = () => {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>("boards");

  // Theme state (monochrome dark vs monochrome light)
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("plynk_theme") as "dark" | "light";
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
      document.documentElement.classList.add("dark");
    }
    localStorage.setItem("plynk_theme", theme);
  }, [theme]);

  // Global capture-phase shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+T or Cmd+T: Theme toggle
      if ((e.ctrlKey || e.metaKey) && (e.key === "t" || e.key === "T" || e.code === "KeyT")) {
        e.preventDefault();
        e.stopPropagation();
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
        return;
      }

      // Ctrl+F or Cmd+F: Open Board Filter
      if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F" || e.code === "KeyF")) {
        if (activeBoardId) {
          e.preventDefault();
          e.stopPropagation();
          window.dispatchEvent(new CustomEvent("plynk:open-filter"));
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown, true);
  }, [activeBoardId]);

  // Onboarding state
  const [userName, setUserName] = useState<string>("SYS_ADMIN");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const savedName = localStorage.getItem("plynk_user_name");
    const onboardingDone = localStorage.getItem("plynk_onboarding_done");

    if (savedName) {
      setUserName(savedName);
    }

    if (!onboardingDone) {
      setIsOnboardingOpen(true);
    }
  }, []);

  const handleOnboardingComplete = (name: string) => {
    localStorage.setItem("plynk_user_name", name);
    localStorage.setItem("plynk_onboarding_done", "true");
    setUserName(name);
    setIsOnboardingOpen(false);
    toast.success(`Welcome to Plynk, ${name}!`);
  };

  // Fetch workspaces
  const { data: workspaces, isLoading: isLoadingWorkspaces, refetch: refetchWorkspaces } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const data = await tauriApi.getWorkspaces();
      return data;
    },
  });

  // Select initial workspace once loaded
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspaceId) {
      setActiveWorkspaceId(workspaces[0].id);
    }
  }, [workspaces, activeWorkspaceId]);

  // Fetch boards for active workspace
  const { data: boards, isLoading: isLoadingBoards } = useQuery({
    queryKey: ["boards", activeWorkspaceId],
    queryFn: () => tauriApi.getBoardsByWorkspace(activeWorkspaceId),
    enabled: !!activeWorkspaceId,
  });

  // Fetch active board details
  const { data: activeBoard } = useQuery({
    queryKey: ["board", activeBoardId],
    queryFn: () => tauriApi.getBoard(activeBoardId!),
    enabled: !!activeBoardId,
  });

  // Fetch lists with cards for active board
  const { data: listsWithCards } = useQuery({
    queryKey: ["board-lists", activeBoardId],
    queryFn: () => tauriApi.getListsByBoard(activeBoardId!),
    enabled: !!activeBoardId,
  });

  const handleCreateWorkspace = () => {
    setIsWorkspaceModalOpen(true);
  };

  const handleConfirmWorkspace = async (name: string) => {
    try {
      const created = await tauriApi.createWorkspace(name);
      toast.success(`Workspace "${created.name}" created!`);
      refetchWorkspaces();
      setActiveWorkspaceId(created.id);
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!workspaces || workspaces.length <= 1) {
      toast.error("Cannot delete the only remaining workspace");
      return;
    }

    const confirmed = confirm(`Are you sure you want to permanently delete workspace "${name}" and all its boards?`);
    if (!confirmed) return;

    try {
      await tauriApi.deleteWorkspace(id);
      toast.success(`Workspace "${name}" deleted`);
      const remaining = workspaces.filter((w) => w.id !== id);
      refetchWorkspaces();
      if (activeWorkspaceId === id && remaining.length > 0) {
        setActiveWorkspaceId(remaining[0].id);
        setActiveBoardId(null);
      }
    } catch (error) {
      toast.error(String(error));
    }
  };

  const activeWorkspace = workspaces?.find((w: Workspace) => w.id === activeWorkspaceId);

  return (
    <div className="h-screen w-screen flex bg-black text-white overflow-hidden select-none">
      <Toaster position="bottom-right" theme={theme} />
      <ModalProvider activeBoardId={activeBoardId || ""} />
      
      {/* Onboarding Pop-up for New Users */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        theme={theme}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
      <WorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        onConfirm={handleConfirmWorkspace}
      />

      {/* SideNavBar Component */}
      <Sidebar
        userName={userName}
        theme={theme}
        onToggleTheme={setTheme}
        workspaces={workspaces || []}
        activeWorkspaceId={activeWorkspaceId}
        activeView={activeView}
        isLoading={isLoadingWorkspaces}
        onSelectWorkspace={(id) => {
          setActiveWorkspaceId(id);
          setActiveBoardId(null);
        }}
        onSelectView={(view) => {
          setActiveView(view);
          setActiveBoardId(null);
        }}
        onCreateWorkspace={handleCreateWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
        {activeBoardId && activeBoard ? (
          <div className="flex flex-col h-full w-full bg-black overflow-hidden">
            <BoardNavbar
              data={activeBoard}
              onDeleteSuccess={() => setActiveBoardId(null)}
            />
            <main className="flex-1 p-6 overflow-x-auto bg-[#F4F4F5] dark:bg-[#131315] transition-colors duration-200">
              <ListContainer
                data={listsWithCards || []}
                boardId={activeBoard.id}
              />
            </main>
          </div>
        ) : (
          <main className="flex-1 p-10 overflow-y-auto bg-white dark:bg-black transition-colors duration-200">
            {activeView === "boards" && (
              <BoardList
                boards={boards || []}
                workspaceId={activeWorkspaceId}
                onSelectBoard={(id) => setActiveBoardId(id)}
                isLoading={isLoadingBoards}
              />
            )}
            {activeView === "activity" && activeWorkspaceId && (
              <ActivityView workspaceId={activeWorkspaceId} />
            )}
            {activeView === "settings" && activeWorkspace && (
              <SettingsView workspace={activeWorkspace} onDeleteWorkspace={handleDeleteWorkspace} />
            )}
            {activeView === "app-settings" && (
              <AppSettingsView
                userName={userName}
                onUpdateUserName={(name) => {
                  localStorage.setItem("plynk_user_name", name);
                  setUserName(name);
                }}
              />
            )}
            {activeView === "backup" && <BackupView />}
          </main>
        )}
      </div>
    </div>
  );
};
