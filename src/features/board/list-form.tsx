import React, { useState, useRef, ElementRef } from "react";
import { Plus, X } from "lucide-react";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tauriApi } from "@/lib/tauri";
import { Input } from "@/components/ui/input";
import { ListWrapper } from "./list-wrapper";

interface ListFormProps {
  boardId: string;
}

export const ListForm = ({ boardId }: ListFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const queryClient = useQueryClient();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
    setTitle("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  useOnClickOutside(formRef, disableEditing);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await tauriApi.createList(boardId, title);
      toast.success(`List "${title}" created`);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      disableEditing();
    } catch (error) {
      toast.error(String(error));
    }
  };

  if (isEditing) {
    return (
      <ListWrapper>
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="w-full p-4 bg-[#131315] border border-[#27272A] space-y-3"
        >
          <Input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ENTER LIST TITLE..."
            className="text-xs font-mono bg-black border-[#27272A] text-white px-3 py-2 h-9 rounded-none uppercase tracking-wider focus-visible:border-white focus-visible:ring-0"
          />
          <div className="flex items-center gap-x-2">
            <button
              type="submit"
              className="bg-white text-black font-mono text-xs uppercase px-4 py-2 font-semibold hover:bg-[#353437] hover:text-white transition-colors"
            >
              Add List
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
      </ListWrapper>
    );
  }

  return (
    <ListWrapper>
      <button
        onClick={enableEditing}
        className="w-full p-4 h-16 bg-white dark:bg-[#09090B] border border-dashed border-[#E4E4E7] dark:border-[#27272A] hover:border-black dark:hover:border-white transition-colors text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white shadow-sm dark:shadow-none flex items-center justify-center gap-x-2 font-mono text-xs uppercase tracking-wider font-semibold"
      >
        <Plus className="h-4 w-4" />
        <span>Add a list</span>
      </button>
    </ListWrapper>
  );
};
