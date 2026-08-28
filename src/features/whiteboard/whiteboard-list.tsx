import { useState } from "react";
import { Plus, PlusCircle, MoreHorizontal, Edit3, Trash2, X, PenTool } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Whiteboard } from "@/types/whiteboard";
import { tauriApi } from "@/lib/tauri";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";

interface WhiteboardListProps {
  whiteboards: Whiteboard[];
  workspaceId: string;
  userName?: string;
  onSelectWhiteboard: (whiteboardId: string) => void;
  isLoading?: boolean;
}

export const WhiteboardList = ({
  whiteboards,
  workspaceId,
  userName,
  onSelectWhiteboard,
  isLoading = false,
}: WhiteboardListProps) => {
  const queryClient = useQueryClient();

  // Create Whiteboard Dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Rename Whiteboard Dialog state
  const [wbToRename, setWbToRename] = useState<Whiteboard | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      setIsCreating(true);
      const created = await tauriApi.createWhiteboard(workspaceId, trimmed);
      queryClient.invalidateQueries({ queryKey: ["workspace-whiteboards", workspaceId] });
      toast.success(`Created "${trimmed}"`);
      setNewTitle("");
      setIsCreateOpen(false);
      onSelectWhiteboard(created.id);
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsCreating(false);
    }
  };

  const openRenameModal = (e: React.MouseEvent, wb: Whiteboard) => {
    e.stopPropagation();
    setWbToRename(wb);
    setRenameTitle(wb.title);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wbToRename) return;
    const trimmed = renameTitle.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await tauriApi.updateWhiteboard(wbToRename.id, trimmed);
      queryClient.invalidateQueries({ queryKey: ["workspace-whiteboards", workspaceId] });
      toast.success(`Renamed to "${trimmed}"`);
      setWbToRename(null);
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleDelete = async (e: React.MouseEvent, wb: Whiteboard) => {
    e.stopPropagation();
    if (!confirm(`Move "${wb.title}" to Recycle Bin?`)) return;

    try {
      await tauriApi.deleteWhiteboard(wb.id, userName);
      queryClient.invalidateQueries({ queryKey: ["workspace-whiteboards", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success(`Moved "${wb.title}" to Recycle Bin`);
    } catch (error) {
      toast.error(String(error));
    }
  };

  if (isLoading) {
    return <WhiteboardList.Skeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Create Whiteboard Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white max-w-md rounded-none shadow-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A] mb-4">
            <div className="flex items-center gap-x-2">
              <PenTool className="h-4 w-4 text-[#09090B] dark:text-white" />
              <h3 className="font-mono text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider">
                <span className="dark:hidden">Initialize New Whiteboard</span>
                <span className="hidden dark:inline">Initialize New Blackboard</span>
              </h3>
            </div>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#71717A] dark:text-[#656467] tracking-wider block">
                <span className="dark:hidden">Whiteboard Title</span>
                <span className="hidden dark:inline">Blackboard Title</span>
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="ENTER TITLE (E.G. ARCHITECTURE SPRINT)..."
                autoFocus
                className="bg-zinc-50 dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-sans text-xs px-3 py-2.5 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 placeholder:text-[#71717A] dark:placeholder:text-[#656467]"
              />
            </div>

            <div className="flex items-center justify-end gap-x-2 pt-2 border-t border-[#E4E4E7] dark:border-[#18181B]">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 bg-zinc-100 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white font-mono text-xs uppercase transition-colors rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-none cursor-pointer"
              >
                {isCreating ? "Initializing..." : "Create Canvas"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Rename Whiteboard Modal Dialog */}
      <Dialog open={!!wbToRename} onOpenChange={() => setWbToRename(null)}>
        <DialogContent className="bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white max-w-md rounded-none shadow-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A] mb-4">
            <div className="flex items-center gap-x-2">
              <Edit3 className="h-4 w-4 text-[#09090B] dark:text-white" />
              <h3 className="font-mono text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider">
                <span className="dark:hidden">Rename Whiteboard</span>
                <span className="hidden dark:inline">Rename Blackboard</span>
              </h3>
            </div>
          </div>

          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#71717A] dark:text-[#656467] tracking-wider block">
                <span className="dark:hidden">Whiteboard Title</span>
                <span className="hidden dark:inline">Blackboard Title</span>
              </label>
              <Input
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="ENTER TITLE..."
                autoFocus
                className="bg-zinc-50 dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-sans text-xs px-3 py-2.5 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 placeholder:text-[#71717A] dark:placeholder:text-[#656467]"
              />
            </div>

            <div className="flex items-center justify-end gap-x-2 pt-2 border-t border-[#E4E4E7] dark:border-[#18181B]">
              <button
                type="button"
                onClick={() => setWbToRename(null)}
                className="px-4 py-2 bg-zinc-100 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white font-mono text-xs uppercase transition-colors rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-none cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header Section matching Boards Overview */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-y-4 pb-4 border-b border-[#E4E4E7] dark:border-[#27272A]">
        <div>
          <h2 className="font-sans text-4xl font-bold text-[#09090B] dark:text-white tracking-tighter">
            <span className="dark:hidden">Your Whiteboards</span>
            <span className="hidden dark:inline">Your Blackboards</span>
          </h2>
          <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider mt-1">
            Active Canvas Workspace
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase px-5 py-2.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 flex items-center gap-x-2 font-semibold cursor-pointer rounded-none"
        >
          <Plus className="h-4 w-4" />
          <span className="dark:hidden">Create Whiteboard</span>
          <span className="hidden dark:inline">Create Blackboard</span>
        </button>
      </div>

      {/* Boards Grid matching Boards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {whiteboards.map((wb, idx) => {
          const formattedId = `ID-${(idx + 1).toString().padStart(3, "0")}`;

          return (
            <div
              key={wb.id}
              onClick={() => onSelectWhiteboard(wb.id)}
              className="bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-[#A1A1AA] transition-all duration-200 p-6 flex flex-col justify-between h-64 group cursor-pointer relative overflow-hidden select-none shadow-sm dark:shadow-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider font-semibold">
                    {formattedId}
                  </span>

                  {/* Three dots options popover */}
                  <div onClick={(e) => e.stopPropagation()} className="relative z-30">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="p-1 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] border border-transparent hover:border-[#E4E4E7] dark:border-[#27272A] transition-colors rounded-none cursor-pointer"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        align="end"
                        className="w-52 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white rounded-none p-3 shadow-xl z-[100]"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] dark:border-[#27272A] mb-2">
                          <span className="font-mono text-[11px] font-semibold text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
                            <span className="dark:hidden">Whiteboard Options</span>
                            <span className="hidden dark:inline">Blackboard Options</span>
                          </span>
                          <PopoverClose asChild>
                            <button
                              type="button"
                              className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors p-0.5 rounded-none cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </PopoverClose>
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={(e) => openRenameModal(e, wb)}
                            className="w-full flex items-center gap-x-2.5 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-[#09090B] dark:text-white hover:bg-zinc-100 dark:hover:bg-[#131315] transition-colors rounded-none cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Rename</span>
                          </button>

                          <div className="my-1 border-t border-[#E4E4E7] dark:border-[#27272A]" />

                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, wb)}
                            className="w-full flex items-center gap-x-2.5 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors rounded-none cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>
                              <span className="dark:hidden">Delete Whiteboard</span>
                              <span className="hidden dark:inline">Delete Blackboard</span>
                            </span>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <h3 className="font-sans text-2xl font-bold text-[#09090B] dark:text-white mb-2 leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">
                  {wb.title}
                </h3>
                <p className="font-sans text-sm text-[#71717A] dark:text-[#c4c7c8] line-clamp-2">
                  <span className="dark:hidden">Local offline whiteboard canvas</span>
                  <span className="hidden dark:inline">Local offline blackboard canvas</span>
                </p>
              </div>

              <div className="flex items-center gap-x-2 mt-auto border-t border-[#E4E4E7] dark:border-[#18181B] pt-4">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-white" />
                <span className="font-mono text-xs text-[#09090B] dark:text-white uppercase tracking-wider font-semibold">
                  Active
                </span>
              </div>
            </div>
          );
        })}

        {/* Initialize New Board Tile */}
        <div
          role="button"
          onClick={() => setIsCreateOpen(true)}
          className="bg-transparent border border-dashed border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-white transition-colors duration-200 p-6 flex flex-col items-center justify-center h-64 group cursor-pointer text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white select-none"
        >
          <PlusCircle className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform text-[#71717A] dark:text-[#656467] group-hover:text-black dark:group-hover:text-white" />
          <span className="font-mono text-xs uppercase tracking-wider font-semibold">
            <span className="dark:hidden">Initialize New Whiteboard</span>
            <span className="hidden dark:inline">Initialize New Blackboard</span>
          </span>
        </div>
      </div>
    </div>
  );
};

WhiteboardList.Skeleton = function SkeletonWhiteboardList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 w-full bg-zinc-100 dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]" />
      <Skeleton className="h-64 w-full bg-zinc-100 dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]" />
      <Skeleton className="h-64 w-full bg-zinc-100 dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A]" />
    </div>
  );
};
