import {
  Camera,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  XYWH,
} from "@/types/whiteboard";

export function colorToCss(color: Color) {
  return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function hexToRgb(hex: string): Color {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function pointerEventToCanvasPoint(
  e: React.PointerEvent,
  camera: Camera,
  containerEl?: HTMLElement | null
): Point {
  let offsetX = 0;
  let offsetY = 0;

  if (containerEl) {
    const rect = containerEl.getBoundingClientRect();
    offsetX = rect.left;
    offsetY = rect.top;
  }

  return {
    x: Math.round(e.clientX - offsetX) - camera.x,
    y: Math.round(e.clientY - offsetY) - camera.y,
  };
}

export function resizeBounds(
  bounds: XYWH,
  corner: Side,
  point: Point
): XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  };

  if ((corner & Side.Left) === Side.Left) {
    result.x = Math.min(point.x, bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if ((corner & Side.Right) === Side.Right) {
    result.x = Math.min(point.x, bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if ((corner & Side.Top) === Side.Top) {
    result.y = Math.min(point.y, bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if ((corner & Side.Bottom) === Side.Bottom) {
    result.y = Math.min(point.y, bounds.y);
    result.height = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[],
  layers: Record<string, Layer>,
  a: Point,
  b: Point
): string[] {
  const rect = {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(a.x - b.x),
    height: Math.abs(a.y - b.y),
  };

  const ids: string[] = [];

  for (const layerId of layerIds) {
    const layer = layers[layerId];
    if (!layer) continue;

    const { x, y, height, width } = layer;

    if (
      rect.x + rect.width > x &&
      rect.x < x + width &&
      rect.y + rect.height > y &&
      rect.y < y + height
    ) {
      ids.push(layerId);
    }
  }

  return ids;
}

export function getContrastingTextColor(color: Color): string {
  const luminance = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return luminance > 182 ? "#000000" : "#FFFFFF";
}

export function penPointsToPathLayer(
  points: number[][],
  color: Color
): PathLayer {
  if (points.length < 2) {
    return {
      type: LayerType.Path,
      x: points[0]?.[0] || 0,
      y: points[0]?.[1] || 0,
      width: 10,
      height: 10,
      fill: color,
      points: [[0, 0, 0.5]],
    };
  }

  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;
    if (left > x) left = x;
    if (top > y) top = y;
    if (right < x) right = x;
    if (bottom < y) bottom = y;
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width: Math.max(1, right - left),
    height: Math.max(1, bottom - top),
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure ?? 0.5]),
  };
}

export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"] as (string | number)[]
  );

  d.push("Z");
  return d.join(" ");
}

export const boundingBox = (layers: Layer[]): XYWH | null => {
  const first = layers[0];
  if (!first) return null;

  let left = first.x;
  let right = first.x + first.width;
  let top = first.y;
  let bottom = first.y + first.height;

  for (let i = 1; i < layers.length; i++) {
    const { x, y, width, height } = layers[i];
    if (left > x) left = x;
    if (right < x + width) right = x + width;
    if (top > y) top = y;
    if (bottom < y + height) bottom = y + height;
  }

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
};
