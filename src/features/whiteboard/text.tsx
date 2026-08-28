import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import { TextLayer } from "@/types/whiteboard";
import { colorToCss } from "@/lib/whiteboard-utils";

const calculateFontSize = (width: number, height: number) => {
  const maxFontSize = 96;
  const scaleFactor = 0.5;
  const fontSizeBasedOnHeight = height * scaleFactor;
  const fontSizeBasedOnWidth = width * scaleFactor;

  return Math.min(
    fontSizeBasedOnHeight,
    fontSizeBasedOnWidth,
    maxFontSize
  );
};

interface TextProps {
  id: string;
  layer: TextLayer;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onValueChange: (id: string, value: string) => void;
  selectionColor?: string;
}

export const Text = ({
  layer,
  onPointerDown,
  onValueChange,
  id,
  selectionColor,
}: TextProps) => {
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
      }}
      className="select-none"
    >
      <ContentEditable
        html={value || "Text"}
        onChange={handleContentChange}
        className="h-full w-full flex items-center justify-center text-center drop-shadow-md outline-none font-sans font-semibold"
        style={{
          fontSize: `${calculateFontSize(width, height)}px`,
          color: fill ? colorToCss(fill) : "#000000",
        }}
      />
    </foreignObject>
  );
};
