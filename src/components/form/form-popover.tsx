import React, { ElementRef, useRef } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { tauriApi } from "@/lib/tauri";

interface FormPopoverProps {
  children: React.ReactNode;
  workspaceId: string;
  onBoardCreated?: (boardId: string) => void;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}

export const FormPopover = ({
  children,
  workspaceId,
  onBoardCreated,
  side = "bottom",
  align,
  sideOffset = 0,
}: FormPopoverProps) => {
  const queryClient = useQueryClient();
  const closeRef = useRef<ElementRef<"button">>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;

    if (!title?.trim()) {
      toast.error("Board title is required");
      return;
    }

    try {
      const board = await tauriApi.createBoard(workspaceId, title.trim(), "default");
      toast.success(`Board "${board.title}" initialized!`);
      closeRef.current?.click();
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      onBoardCreated?.(board.id);
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        className="w-80 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white rounded-none p-5 shadow-2xl z-[100]"
        side={side}
        sideOffset={sideOffset}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7] dark:border-[#27272A] mb-4">
          <span className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white tracking-wider flex items-center gap-x-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Create Board</span>
          </span>
          <PopoverClose ref={closeRef} asChild>
            <button
              type="button"
              className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] p-1 transition-colors rounded-none"
            >
              <X className="h-4 w-4" />
            </button>
          </PopoverClose>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase font-semibold text-[#71717A] dark:text-[#656467] tracking-wider block">
              Board Title
            </label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="ENTER BOARD TITLE..."
              autoFocus
              className="bg-white dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-sans text-xs px-3 py-2 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 placeholder:text-[#71717A] dark:placeholder:text-[#656467] uppercase font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold py-2.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 rounded-none cursor-pointer"
          >
            Create Workspace Board
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
