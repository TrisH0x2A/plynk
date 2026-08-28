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
  zoom: number = 1
): Point {
  return {
    x: Math.round((e.clientX - camera.x) / zoom),
    y: Math.round((e.clientY - camera.y) / zoom),
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
  return luminance > 160 ? "#09090B" : "#FFFFFF";
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

  const width = Math.max(10, right - left);
  const height = Math.max(10, bottom - top);

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    width,
    height,
    fill: color,
    points: points.map(([x, y, pressure]) => [x - left, y - top, pressure ?? 0.5]),
  };
}

/**
 * Generates smooth SVG stroke string from stroke coordinates.
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return "";

  const d: (string | number)[] = ["M", ...stroke[0], "Q"];

  for (let i = 0; i < stroke.length; i++) {
    const [x0, y0] = stroke[i];
    const [x1, y1] = stroke[(i + 1) % stroke.length];
    d.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }

  d.push("Z");
  return d.join(" ");
}

/**
 * Built-in smooth outline generator for freehand paths.
 * Generates smooth left and right polygon contours around input points with pressure.
 */
export function getStrokePoints(
  points: number[][],
  options: { size?: number; thinning?: number; smoothing?: number } = {}
): number[][] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    const [x, y] = points[0];
    const r = (options.size || 8) / 2;
    return [
      [x - r, y - r],
      [x + r, y - r],
      [x + r, y + r],
      [x - r, y + r],
    ];
  }

  const size = options.size ?? 8;
  const leftPts: number[][] = [];
  const rightPts: number[][] = [];

  for (let i = 0; i < points.length; i++) {
    const [x, y, pressure = 0.5] = points[i];
    const width = Math.max(2, size * (pressure + 0.3));

    let dx = 0;
    let dy = 0;

    if (i < points.length - 1) {
      dx = points[i + 1][0] - x;
      dy = points[i + 1][1] - y;
    } else {
      dx = x - points[i - 1][0];
      dy = y - points[i - 1][1];
    }

    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    leftPts.push([x + (nx * width) / 2, y + (ny * width) / 2]);
    rightPts.push([x - (nx * width) / 2, y - (ny * width) / 2]);
  }

  return [...leftPts, ...rightPts.reverse()];
}
