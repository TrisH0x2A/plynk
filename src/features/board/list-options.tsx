import { ElementRef, useRef } from "react";
import { toast } from "sonner";
import { MoreHorizontal, X, Plus, Copy, Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { List } from "@/types";
import { tauriApi } from "@/lib/tauri";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverClose
} from "@/components/ui/popover";

interface ListOptionsProps {
  data: List;
  boardId: string;
  onAddCard: () => void;
}

export const ListOptions = ({ data, boardId, onAddCard }: ListOptionsProps) => {
  const queryClient = useQueryClient();
  const closeRef = useRef<ElementRef<"button">>(null);

  const onDelete = async () => {
    try {
      await tauriApi.deleteList(data.id);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success(`List "${data.title}" deleted`);
      closeRef.current?.click();
    } catch (error) {
      toast.error(String(error));
    }
  };

  const onCopy = async () => {
    try {
      const created = await tauriApi.createList(boardId, `${data.title} - Copy`);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`List "${created.title}" created`);
      closeRef.current?.click();
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors p-1 rounded-none cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-56 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white rounded-none p-3 shadow-2xl z-[100]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] dark:border-[#27272A] mb-2">
          <span className="font-mono text-xs font-semibold text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
            List Actions
          </span>
          <PopoverClose ref={closeRef} asChild>
            <button
              type="button"
              className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors p-1 rounded-none cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </PopoverClose>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={onAddCard}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-[#09090B] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors rounded-none cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Add card...</span>
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-[#09090B] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors rounded-none cursor-pointer"
          >
            <Copy className="h-3.5 w-3.5 text-zinc-500 dark:text-zinc-400" />
            <span>Copy list...</span>
          </button>

          <div className="my-1 border-t border-[#E4E4E7] dark:border-[#27272A]" />

          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-800 dark:hover:text-rose-300 transition-colors rounded-none cursor-pointer font-semibold"
          >
            <Trash className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span>Delete list</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
