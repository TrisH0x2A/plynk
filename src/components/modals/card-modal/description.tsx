import { toast } from "sonner";
import { AlignLeft } from "lucide-react";
import { useState, useRef, ElementRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";

import { Card } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionProps {
  data: Card;
  boardId: string;
}

export const Description = ({ data, boardId }: DescriptionProps) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const formRef = useRef<ElementRef<"form">>(null);
  const textareaRef = useRef<ElementRef<"textarea">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;

    try {
      const updated = await tauriApi.updateCard(data.id, undefined, description);
      queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`Card "${updated.title}" description updated`);
      disableEditing();
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-[#09090B] dark:text-white shrink-0" />
      <div className="w-full">
        <p className="font-mono text-xs font-semibold text-[#09090B] dark:text-white uppercase tracking-wider mb-2">
          Description
        </p>
        {isEditing ? (
          <form onSubmit={onSubmit} ref={formRef} className="space-y-2">
            <Textarea
              name="description"
              className="w-full bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-zinc-900 dark:text-white font-sans text-sm p-3 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 min-h-[96px]"
              placeholder="Add a more detailed description..."
              defaultValue={data.description || undefined}
              ref={textareaRef}
            />
            <div className="flex items-center gap-x-2">
              <button
                type="submit"
                className="bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase px-4 py-2 font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors cursor-pointer rounded-none"
              >
                Save
              </button>
              <button
                type="button"
                onClick={disableEditing}
                className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors font-mono text-xs uppercase px-3 py-2 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            className="min-h-[80px] bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-white text-sm text-zinc-700 dark:text-[#c4c7c8] font-sans p-3.5 rounded-none cursor-pointer transition-colors"
          >
            {data.description || "Add a more detailed description..."}
          </div>
        )}
      </div>
    </div>
  );
};
