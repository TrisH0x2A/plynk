import { toast } from "sonner";
import { MoreHorizontal, X, Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { tauriApi } from "@/lib/tauri";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BoardOptionsProps {
  id: string;
  workspaceId: string;
  onDeleteSuccess: () => void;
}

export const BoardOptions = ({ id, workspaceId, onDeleteSuccess }: BoardOptionsProps) => {
  const queryClient = useQueryClient();

  const onDelete = async () => {
    try {
      await tauriApi.deleteBoard(id);
      toast.success("Board deleted");
      queryClient.invalidateQueries({ queryKey: ["boards", workspaceId] });
      onDeleteSuccess();
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 bg-[#131315] border border-[#27272A] text-[#656467] hover:text-white transition-colors"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-56 bg-[#09090B] border border-[#27272A] text-white rounded-none p-3 shadow-2xl z-[100]"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[#27272A] mb-2">
          <span className="font-mono text-xs font-semibold text-[#656467] uppercase">
            Board Actions
          </span>
          <PopoverClose asChild>
            <button
              type="button"
              className="text-[#656467] hover:text-white transition-colors p-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </PopoverClose>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="w-full flex items-center gap-x-2 p-2 px-3 text-left font-mono text-xs uppercase tracking-wider text-rose-400 hover:bg-[#131315] hover:text-rose-300 transition-colors"
        >
          <Trash className="h-3.5 w-3.5" />
          <span>Delete this board</span>
        </button>
      </PopoverContent>
    </Popover>
  );
};
