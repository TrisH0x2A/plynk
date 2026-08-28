import React from "react";
import { Board } from "@/types";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";
import { BoardFilterPopover } from "./board-filter-popover";

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
        <BoardFilterPopover />

        <BoardOptions
          id={data.id}
          workspaceId={data.workspace_id}
          onDeleteSuccess={onDeleteSuccess}
        />
      </div>
    </div>
  );
};
