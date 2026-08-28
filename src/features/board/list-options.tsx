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
          className="text-[#656467] hover:text-white transition-colors p-1"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-56 bg-[#09090B] border border-[#27272A] text-white rounded-none p-3 shadow-2xl z-[100]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#27272A] mb-2">
          <span className="font-mono text-xs font-semibold text-[#656467] uppercase">
            List Actions
          </span>
          <PopoverClose ref={closeRef} asChild>
            <button
              type="button"
              className="text-[#656467] hover:text-white transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </PopoverClose>
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={onAddCard}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-white hover:bg-[#131315] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add card...</span>
          </button>

          <button
            type="button"
            onClick={onCopy}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-white hover:bg-[#131315] transition-colors"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy list...</span>
          </button>

          <div className="my-1 border-t border-[#27272A]" />

          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-rose-400 hover:bg-[#131315] hover:text-rose-300 transition-colors"
          >
            <Trash className="h-3.5 w-3.5" />
            <span>Delete list</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
