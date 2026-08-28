import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { Layout } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, List } from "@/types";
import { tauriApi } from "@/lib/tauri";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  data: Card & { list?: List };
  boardId: string;
}

export const Header = ({ data, boardId }: HeaderProps) => {
  const queryClient = useQueryClient();
  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState(data.title);

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newTitle = formData.get("title") as string;

    if (!newTitle || newTitle === data.title) {
      return;
    }

    try {
      const updated = await tauriApi.updateCard(data.id, newTitle);
      queryClient.invalidateQueries({ queryKey: ["card", data.id] });
      queryClient.invalidateQueries({ queryKey: ["card-logs", data.id] });
      queryClient.invalidateQueries({ queryKey: ["board-lists", boardId] });
      toast.success(`Renamed to "${updated.title}"`);
      setTitle(updated.title);
    } catch (error) {
      toast.error(String(error));
    }
  };

  return (
    <div className="flex items-start gap-x-3 mb-6 w-full pr-12">
      <Layout className="h-5 w-5 mt-1 text-[#09090B] dark:text-white shrink-0" />
      <div className="w-full">
        <form onSubmit={onSubmit}>
          <Input
            ref={inputRef}
            onBlur={onBlur}
            name="title"
            defaultValue={title}
            className="font-sans font-bold text-xl px-3 py-1.5 text-[#09090B] dark:text-white bg-white dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0 rounded-none w-full mb-1 truncate"
          />
        </form>
        {data.list && (
          <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
            In list <span className="text-[#09090B] dark:text-white font-semibold underline">{data.list.title}</span>
          </p>
        )}
      </div>
    </div>
  );
};
