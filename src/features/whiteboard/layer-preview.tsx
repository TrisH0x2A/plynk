import { memo } from "react";
import { colorToCss } from "@/lib/whiteboard-utils";
import { Layer, LayerType } from "@/types/whiteboard";

import { Text } from "./text";
import { Ellipse } from "./ellipse";
import { Rectangle } from "./rectangle";
import { Note } from "./note";
import { Path } from "./path";

interface LayerPreviewProps {
  id: string;
  layer: Layer;
  onLayerPointerDown: (e: React.PointerEvent, layerId: string) => void;
  onValueChange: (id: string, value: string) => void;
  selectionColor?: string;
}

export const LayerPreview = memo(({
  id,
  layer,
  onLayerPointerDown,
  onValueChange,
  selectionColor,
}: LayerPreviewProps) => {
  if (!layer) return null;

  switch (layer.type) {
    case LayerType.Path:
      return (
        <Path
          key={id}
          points={layer.points}
          onPointerDown={(e) => onLayerPointerDown(e, id)}
          x={layer.x}
          y={layer.y}
          fill={layer.fill ? colorToCss(layer.fill) : "#000000"}
          stroke={selectionColor}
        />
      );
    case LayerType.Note:
      return (
        <Note
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          onValueChange={onValueChange}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Text:
      return (
        <Text
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          onValueChange={onValueChange}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Ellipse:
      return (
        <Ellipse
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    case LayerType.Rectangle:
      return (
        <Rectangle
          id={id}
          layer={layer}
          onPointerDown={onLayerPointerDown}
          selectionColor={selectionColor}
        />
      );
    default:
      return null;
  }
});

LayerPreview.displayName = "LayerPreview";
