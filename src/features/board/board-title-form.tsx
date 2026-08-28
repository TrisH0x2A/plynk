import { useState, useRef, ElementRef } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Board } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BoardTitleFormProps {
  data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
  const queryClient = useQueryClient();
  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get("title") as string;

    if (!newTitle || newTitle === data.title) {
      return disableEditing();
    }

    try {
      const updated = await tauriApi.updateBoard(data.id, newTitle);
      toast.success(`Board "${updated.title}" updated!`);
      setTitle(updated.title);
      disableEditing();
      queryClient.invalidateQueries({ queryKey: ["board", data.id] });
      queryClient.invalidateQueries({ queryKey: ["boards", data.workspace_id] });
    } catch (error) {
      toast.error(String(error));
    }
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  if (isEditing) {
    return (
      <form onSubmit={onSubmit} ref={formRef} className="flex items-center gap-x-2">
        <Input
          ref={inputRef}
          name="title"
          onBlur={onBlur}
          defaultValue={title}
          className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none text-white"
        />
      </form>
    );
  }

  return (
    <Button
      onClick={enableEditing}
      variant="transparent"
      className="font-bold text-lg h-auto w-auto p-1 px-2"
    >
      {title}
    </Button>
  );
};
