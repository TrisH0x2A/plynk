import { Color } from "@/types/whiteboard";
import { colorToCss } from "@/lib/whiteboard-utils";

interface ColorPickerProps {
  onChange: (color: Color) => void;
}

export const ColorPicker = ({
  onChange,
}: ColorPickerProps) => {
  return (
    <div className="flex flex-wrap gap-1.5 items-center max-w-[164px] pr-2 mr-2 border-r border-[#E4E4E7] dark:border-[#27272A]">
      <ColorButton color={{ r: 243, g: 82, b: 35 }} onClick={onChange} />
      <ColorButton color={{ r: 255, g: 249, b: 177 }} onClick={onChange} />
      <ColorButton color={{ r: 68, g: 202, b: 99 }} onClick={onChange} />
      <ColorButton color={{ r: 39, g: 142, b: 237 }} onClick={onChange} />
      <ColorButton color={{ r: 155, g: 105, b: 245 }} onClick={onChange} />
      <ColorButton color={{ r: 252, g: 142, b: 42 }} onClick={onChange} />
      <ColorButton color={{ r: 0, g: 0, b: 0 }} onClick={onChange} />
      <ColorButton color={{ r: 255, g: 255, b: 255 }} onClick={onChange} />
    </div>
  );
};

interface ColorButtonProps {
  onClick: (color: Color) => void;
  color: Color;
}

const ColorButton = ({
  onClick,
  color,
}: ColorButtonProps) => {
  return (
    <button
      type="button"
      className="w-6 h-6 items-center flex justify-center hover:opacity-80 transition cursor-pointer p-0 border-0 bg-transparent"
      onClick={() => onClick(color)}
    >
      <div
        className="h-6 w-6 rounded-none border border-black/20 dark:border-white/20 hover:scale-110 transition-transform"
        style={{ background: colorToCss(color) }}
      />
    </button>
  );
};
