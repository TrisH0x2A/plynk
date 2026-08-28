export type Color = {
  r: number;
  g: number;
  b: number;
};

export type Camera = {
  x: number;
  y: number;
  zoom: number;
};

export enum LayerType {
  Rectangle = "Rectangle",
  Ellipse = "Ellipse",
  Path = "Path",
  Text = "Text",
  Note = "Note",
}

export type RectangleLayer = {
  type: LayerType.Rectangle;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type EllipseLayer = {
  type: LayerType.Ellipse;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type PathLayer = {
  type: LayerType.Path;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  points: number[][]; // [x, y, pressure]
  value?: string;
};

export type TextLayer = {
  type: LayerType.Text;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
  fontSize?: number;
};

export type NoteLayer = {
  type: LayerType.Note;
  x: number;
  y: number;
  height: number;
  width: number;
  fill: Color;
  value?: string;
};

export type Layer = RectangleLayer | EllipseLayer | PathLayer | TextLayer | NoteLayer;

export type Point = {
  x: number;
  y: number;
};

export type XYWH = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export enum Side {
  Top = 1,
  Bottom = 2,
  Left = 4,
  Right = 8,
}

export enum CanvasMode {
  None = "None",
  Pressing = "Pressing",
  SelectionNet = "SelectionNet",
  Translating = "Translating",
  Inserting = "Inserting",
  Resizing = "Resizing",
  Pencil = "Pencil",
}

export type CanvasState =
  | {
      mode: CanvasMode.None;
    }
  | {
      mode: CanvasMode.SelectionNet;
      origin: Point;
      current?: Point;
    }
  | {
      mode: CanvasMode.Translating;
      current: Point;
    }
  | {
      mode: CanvasMode.Inserting;
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note;
    }
  | {
      mode: CanvasMode.Pencil;
    }
  | {
      mode: CanvasMode.Pressing;
      origin: Point;
    }
  | {
      mode: CanvasMode.Resizing;
      initialBounds: XYWH;
      corner: Side;
    };

export interface Whiteboard {
  id: string;
  workspace_id: string;
  title: string;
  canvas_data: string;
  created_at: string;
  updated_at: string;
}

export interface WhiteboardCanvasData {
  layers: Record<string, Layer>;
  layerIds: string[];
  camera?: Camera;
}
