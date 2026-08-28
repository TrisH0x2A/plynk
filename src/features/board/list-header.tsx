import React, { useState, useRef, ElementRef } from "react";
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import { ListWithCards } from "@/types";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { tauriApi } from "@/lib/tauri";
import { ListOptions } from "./list-options";

interface ListHeaderProps {
  data: ListWithCards;
  boardId: string;
  onAddCard: () => void;
}

export const ListHeader = ({ data, boardId, onAddCard }: ListHeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);
  const queryClient = useQueryClient();

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title === data.title) {
      return disableEditing();
    }

    try {
      await tauriApi.updateList(data.id, title);
      toast.success(`Renamed to "${title}"`);
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      disableEditing();
    } catch (error) {
      toast.error(String(error));
    }
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      formRef.current?.requestSubmit();
    }
  };

  useEventListener("keydown", onKeyDown);

  return (
    <div className="p-4 border-b border-[#E4E4E7] dark:border-[#27272A] flex justify-between items-center bg-[#FAFAFA] dark:bg-black select-none">
      {isEditing ? (
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 mr-2">
          <Input
            ref={inputRef}
            onBlur={disableEditing}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs font-mono font-bold bg-white dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] text-black dark:text-white px-2 py-1 h-7 rounded-none uppercase tracking-wider"
          />
        </form>
      ) : (
        <div
          onClick={enableEditing}
          className="text-xs font-mono font-bold text-[#09090B] dark:text-white uppercase tracking-widest cursor-pointer hover:text-black dark:hover:text-[#c4c7c8] flex items-center gap-x-2"
        >
          <span className="w-2 h-2 rounded-full bg-black dark:bg-white block" />
          <span>{data.title}</span>
        </div>
      )}

      <div className="flex items-center gap-x-2">
        <span className="font-mono text-xs text-[#71717A] dark:text-[#656467]">
          {data.cards?.length || 0}
        </span>
        <ListOptions data={data} boardId={boardId} onAddCard={onAddCard} />
      </div>
    </div>
  );
};
