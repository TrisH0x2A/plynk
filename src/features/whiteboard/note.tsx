import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { NoteLayer } from "@/types/whiteboard";
import { colorToCss, getContrastingTextColor } from "@/lib/whiteboard-utils";

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.15;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(
    fontSizeBasedOnHeight,
    fontSizeBasedOnWidth,
    maxFontSize
  );
};

interface NoteProps {
  id: string;
  layer: NoteLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onValueChange: (id: string, value: string) => void;
  selectionColor?: string;
}

export const Note = ({
  layer,
  onPointerDown,
  onValueChange,
  id,
  selectionColor,
}: NoteProps) => {
  const { x, y, width, height, fill, value } = layer;

  const handleContentChange = (e: ContentEditableEvent) => {
    onValueChange(id, e.target.value);
  };

  return (
    <foreignObject
      x={x}
      y={y}
      width={width}
      height={height}
      onPointerDown={(e) => onPointerDown(e, id)}
      style={{
        outline: selectionColor ? `1.5px solid ${selectionColor}` : "none",
        backgroundColor: fill ? colorToCss(fill) : "#FEF08A",
      }}
      className="shadow-md drop-shadow-xl select-none"
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleContentChange}
        className="h-full w-full flex items-center justify-center text-center outline-none font-sans font-medium p-3"
        style={{
          fontSize: `${calculateFontSize(width, height)}px`,
          color: fill ? getContrastingTextColor(fill) : "#000000",
        }}
      />
    </foreignObject>
  );
};
