import { memo } from "react";
import { BringToFront, SendToBack, Trash2 } from "lucide-react";
import { Camera, Color, XYWH } from "@/types/whiteboard";
import { ColorPicker } from "./color-picker";

interface SelectionToolsProps {
  camera: Camera;
  selectionBounds: XYWH | null;
  setLastUsedColor: (color: Color) => void;
  onMoveToFront: () => void;
  onMoveToBack: () => void;
  onDelete: () => void;
}

export const SelectionTools = memo(({
  camera,
  selectionBounds,
  setLastUsedColor,
  onMoveToFront,
  onMoveToBack,
  onDelete,
}: SelectionToolsProps) => {
  if (!selectionBounds) return null;

  const x = selectionBounds.width / 2 + selectionBounds.x + camera.x;
  const y = selectionBounds.y + camera.y;

  return (
    <div
      className="absolute p-2 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] shadow-xl flex items-center select-none z-50 pointer-events-auto"
      style={{
        transform: `translate(calc(${x}px - 50%), calc(${y - 16}px - 100%))`,
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ColorPicker onChange={setLastUsedColor} />
      <div className="flex items-center gap-x-1">
        <button
          type="button"
          onClick={onMoveToFront}
          title="Bring to front"
          className="p-1.5 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] transition-colors rounded-none cursor-pointer"
        >
          <BringToFront className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onMoveToBack}
          title="Send to back"
          className="p-1.5 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] transition-colors rounded-none cursor-pointer"
        >
          <SendToBack className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center pl-2 ml-2 border-l border-[#E4E4E7] dark:border-[#27272A]">
        <button
          type="button"
          onClick={onDelete}
          title="Delete layer"
          className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors rounded-none cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

SelectionTools.displayName = "SelectionTools";
