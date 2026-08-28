import React, { useState } from "react";
import { Plus, MoreHorizontal, PlusCircle, Trash2, Edit3, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Board } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { Skeleton } from "@/components/ui/skeleton";
import { FormPopover } from "@/components/form/form-popover";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface BoardListProps {
  boards: Board[];
  workspaceId: string;
  onSelectBoard: (boardId: string) => void;
  isLoading?: boolean;
}

export const BoardList = ({
  boards,
  workspaceId,
  onSelectBoard,
  isLoading = false,
}: BoardListProps) => {
  const queryClient = useQueryClient();
  const [boardToRename, setBoardToRename] = useState<Board | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  if (isLoading) {
    return <BoardList.Skeleton />;
  }

  const openRenameModal = (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    setBoardToRename(board);
    setRenameTitle(board.title);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardToRename || !renameTitle.trim()) return;

    try {
      await tauriApi.updateBoard(boardToRename.id, renameTitle.trim());
      toast.success(`Board renamed to "${renameTitle.trim()}"`);
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      setBoardToRename(null);
    } catch (err) {
      toast.error(String(err));
    }
  };

  const handleDelete = async (e: React.MouseEvent, board: Board) => {
    e.stopPropagation();
    const confirmed = confirm(`Are you sure you want to delete "${board.title}"?`);
    if (!confirmed) return;

    try {
      await tauriApi.deleteBoard(board.id);
      toast.success(`Board "${board.title}" deleted`);
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Rename Dialog Modal */}
      <Dialog open={!!boardToRename} onOpenChange={() => setBoardToRename(null)}>
        <DialogContent className="bg-[#09090B] border border-[#27272A] text-white max-w-md rounded-none shadow-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
            <div className="flex items-center gap-x-2">
              <Edit3 className="h-4 w-4 text-white" />
              <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Rename Board
              </h3>
            </div>
          </div>

          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] uppercase font-semibold text-[#656467] tracking-wider block">
                Board Title
              </label>
              <Input
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="ENTER BOARD TITLE..."
                autoFocus
                className="bg-black border border-[#27272A] text-white font-sans text-xs px-3 py-2.5 rounded-none focus-visible:border-white focus-visible:ring-0 placeholder:text-[#656467]"
              />
            </div>

            <div className="flex items-center justify-end gap-x-2 pt-2 border-t border-[#18181B]">
              <button
                type="button"
                onClick={() => setBoardToRename(null)}
                className="px-4 py-2 bg-[#131315] border border-[#27272A] text-[#656467] hover:text-white font-mono text-xs uppercase transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-[#353437] hover:text-white transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-y-4 pb-4 border-b border-[#27272A]">
        <div>
          <h2 className="font-sans text-4xl font-bold text-white tracking-tighter">
            Your Boards
          </h2>
          <p className="font-mono text-xs text-[#656467] uppercase tracking-wider mt-1">
            Active Projects Workspace
          </p>
        </div>

        <FormPopover
          workspaceId={workspaceId}
          onBoardCreated={onSelectBoard}
          side="bottom"
          align="end"
        >
          <button
            type="button"
            className="bg-white text-black font-mono text-xs uppercase px-5 py-2.5 hover:bg-[#353437] hover:text-white transition-colors duration-200 flex items-center gap-x-2 font-semibold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Board</span>
          </button>
        </FormPopover>
      </div>

      {/* Boards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.map((board, idx) => {
          const formattedId = `ID-${(idx + 1).toString().padStart(3, "0")}`;
          return (
            <div
              key={board.id}
              onClick={() => onSelectBoard(board.id)}
              className="bg-[#09090B] border border-[#27272A] hover:border-[#A1A1AA] transition-all duration-200 p-6 flex flex-col justify-between h-64 group cursor-pointer relative overflow-hidden select-none"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs text-[#656467] uppercase tracking-wider font-semibold">
                    {formattedId}
                  </span>

                  {/* Three dots options popover */}
                  <div onClick={(e) => e.stopPropagation()} className="relative z-30">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="p-1 text-[#656467] hover:text-white hover:bg-[#18181B] border border-transparent hover:border-[#27272A] transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        align="end"
                        className="w-52 bg-[#09090B] border border-[#27272A] text-white rounded-none p-3 shadow-2xl z-[100]"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#27272A] mb-2">
                          <span className="font-mono text-[11px] font-semibold text-[#656467] uppercase tracking-wider">
                            Board Options
                          </span>
                          <PopoverClose asChild>
                            <button
                              type="button"
                              className="text-[#656467] hover:text-white transition-colors p-0.5"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </PopoverClose>
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={(e) => openRenameModal(e, board)}
                            className="w-full flex items-center gap-x-2.5 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-white hover:bg-[#131315] transition-colors"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-400" />
                            <span>Rename board</span>
                          </button>

                          <div className="my-1 border-t border-[#27272A]" />

                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, board)}
                            className="w-full flex items-center gap-x-2.5 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-rose-400 hover:bg-[#131315] hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete board</span>
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <h3 className="font-sans text-2xl font-bold text-white mb-2 leading-tight group-hover:text-white transition-colors">
                  {board.title}
                </h3>
                <p className="font-sans text-sm text-[#c4c7c8] line-clamp-2">
                  Local offline board workspace
                </p>
              </div>

              <div className="flex items-center gap-x-2 mt-auto border-t border-[#18181B] pt-4">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span className="font-mono text-xs text-white uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>
          );
        })}

        {/* Initialize New Board Tile */}
        <FormPopover
          workspaceId={workspaceId}
          onBoardCreated={onSelectBoard}
          side="right"
          sideOffset={10}
        >
          <div
            role="button"
            className="bg-transparent border border-dashed border-[#27272A] hover:border-white transition-colors duration-200 p-6 flex flex-col items-center justify-center h-64 group cursor-pointer text-[#656467] hover:text-white"
          >
            <PlusCircle className="h-10 w-10 mb-3 group-hover:scale-110 transition-transform text-[#656467] group-hover:text-white" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">
              Initialize New Board
            </span>
          </div>
        </FormPopover>
      </div>
    </div>
  );
};

BoardList.Skeleton = function SkeletonBoardList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Skeleton className="h-64 w-full bg-[#09090B] border border-[#27272A]" />
      <Skeleton className="h-64 w-full bg-[#09090B] border border-[#27272A]" />
      <Skeleton className="h-64 w-full bg-[#09090B] border border-[#27272A]" />
    </div>
  );
};
