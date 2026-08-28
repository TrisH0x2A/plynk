import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { useCardModal } from "@/stores/use-card-modal";

interface ActionsProps {
  data: Card;
  boardId: string;
}

export const Actions = ({ data, boardId }: ActionsProps) => {
  const cardModal = useCardModal();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const onCopy = async () => {
    try {
      setIsLoading(true);
      const copied = await tauriApi.copyCard(data.id);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`Card "${copied.title}" copied`);
      cardModal.onClose();
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await tauriApi.deleteCard(data.id);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`Card "${data.title}" deleted`);
      cardModal.onClose();
    } catch (error) {
      toast.error(String(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      <p className="font-mono text-xs font-semibold text-[#71717A] dark:text-[#656467] uppercase tracking-wider mb-2">
        Actions
      </p>
      <button
        type="button"
        onClick={onCopy}
        disabled={isLoading}
        className="w-full flex items-center gap-x-2 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-zinc-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-mono text-xs uppercase tracking-wider transition-colors px-3 py-2.5 rounded-none font-semibold cursor-pointer"
      >
        <Copy className="h-4 w-4" />
        <span>Copy</span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={isLoading}
        className="w-full flex items-center gap-x-2 bg-rose-50 dark:bg-[#131315] border border-rose-200 dark:border-[#27272A] text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white hover:border-rose-600 font-mono text-xs uppercase tracking-wider transition-colors px-3 py-2.5 rounded-none font-semibold cursor-pointer"
      >
        <Trash className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );
};
