import React from "react";
import { Filter } from "lucide-react";
import { Board } from "@/types";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";

interface BoardNavbarProps {
  data: Board;
  onDeleteSuccess: () => void;
}

export const BoardNavbar = ({ data, onDeleteSuccess }: BoardNavbarProps) => {
  return (
    <div className="w-full h-16 bg-white dark:bg-[#000000] border-b border-[#E4E4E7] dark:border-[#27272A] px-6 flex items-center justify-between z-40 select-none transition-colors duration-200">
      <div>
        <BoardTitleForm data={data} />
        <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider mt-0.5 font-semibold">
          PROJECT WORKSPACE // SPRINT ACTIVE
        </p>
      </div>

      <div className="flex items-center gap-x-3">
        <button
          type="button"
          className="h-9 px-3.5 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-xs uppercase text-[#09090B] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] hover:border-black dark:hover:border-[#A1A1AA] transition-colors flex items-center gap-x-2 font-semibold rounded-none cursor-pointer"
        >
          <Filter className="h-3.5 w-3.5 text-[#71717A] dark:text-[#656467]" />
          <span>Filter</span>
        </button>

        <BoardOptions
          id={data.id}
          workspaceId={data.workspace_id}
          onDeleteSuccess={onDeleteSuccess}
        />
      </div>
    </div>
  );
};
