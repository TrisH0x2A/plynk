import React, { useState, useRef, ElementRef, forwardRef } from "react";
import { Plus, X } from "lucide-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tauriApi } from "@/lib/tauri";
import { Textarea } from "@/components/ui/textarea";

interface CardFormProps {
  listId: string;
  boardId: string;
  isEditing: boolean;
  enableEditing: () => void;
  disableEditing: () => void;
}

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, boardId, isEditing, enableEditing, disableEditing }, ref) => {
    const [title, setTitle] = useState("");
    const formRef = useRef<ElementRef<"form">>(null);
    const queryClient = useQueryClient();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    useEventListener("keydown", onKeyDown);
    useOnClickOutside(formRef, disableEditing);

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) return;

      try {
        await tauriApi.createCard(listId, title);
        toast.success(`Card "${title}" created`);
        queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
        setTitle("");
      } catch (error) {
        toast.error(String(error));
      }
    };

    if (isEditing) {
      return (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="m-1 px-1 py-0.5 space-y-3"
        >
          <Textarea
            id="title"
            name="title"
            ref={ref}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Enter card title..."
            className="text-xs bg-black border border-[#27272A] text-white p-3 rounded-none focus-visible:ring-0 focus-visible:border-white resize-none"
          />
          <div className="flex items-center gap-x-2">
            <button
              type="submit"
              className="bg-white text-black font-mono text-xs uppercase px-4 py-2 font-semibold hover:bg-[#353437] hover:text-white transition-colors"
            >
              Add Card
            </button>
            <button
              type="button"
              onClick={disableEditing}
              className="text-[#656467] hover:text-white transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="pt-2 px-2">
        <button
          onClick={enableEditing}
          className="w-full h-[38px] p-2 bg-transparent border border-dashed border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-white transition-colors text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-transparent flex items-center justify-center gap-x-2 font-mono text-xs uppercase tracking-wider"
        >
          <Plus className="h-4 w-4" />
          <span>Add a card</span>
        </button>
      </div>
    );
  }
);

CardForm.displayName = "CardForm";
