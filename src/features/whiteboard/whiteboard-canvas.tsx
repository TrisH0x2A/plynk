import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  MousePointer,
  Square,
  Circle,
  Type,
  StickyNote,
  Pencil,
  Undo2,
  Redo2,
  Trash2,
  Copy,
  BringToFront,
  SendToBack,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import getStroke from "perfect-freehand";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  Layer,
  LayerType,
  PathLayer,
  Point,
  Side,
  Whiteboard,
  WhiteboardCanvasData,
  XYWH,
} from "@/types/whiteboard";
import { tauriApi } from "@/lib/tauri";
import {
  colorToCss,
  getContrastingTextColor,
  getSvgPathFromStroke,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
  findIntersectingLayersWithRectangle,
} from "@/lib/whiteboard-utils";

interface WhiteboardCanvasProps {
  whiteboard: Whiteboard;
  onBack: () => void;
}

const FONT_SIZES = [12, 16, 20, 28, 36, 48, 64];

const PRESET_COLORS: Color[] = [
  { r: 24, g: 24, b: 27 },    // Black / Dark Zinc
  { r: 244, g: 244, b: 245 }, // White / Light Zinc
  { r: 225, g: 29, b: 72 },   // Rose Red
  { r: 234, g: 88, b: 12 },   // Orange
  { r: 234, g: 179, b: 8 },   // Yellow / Amber
  { r: 16, g: 185, b: 129 },  // Emerald Green
  { r: 37, g: 99, b: 235 },   // Electric Blue
  { r: 147, g: 51, b: 234 },  // Purple
];

export const WhiteboardCanvas = ({ whiteboard, onBack }: WhiteboardCanvasProps) => {
  // Parse initial canvas data
  const initialData: WhiteboardCanvasData = (() => {
    try {
      const parsed = JSON.parse(whiteboard.canvas_data);
      return {
        layers: parsed.layers || {},
        layerIds: parsed.layerIds || [],
        camera: parsed.camera || { x: 0, y: 0, zoom: 1 },
      };
    } catch {
      return { layers: {}, layerIds: [], camera: { x: 0, y: 0, zoom: 1 } };
    }
  })();

  const [layers, setLayers] = useState<Record<string, Layer>>(initialData.layers);
  const [layerIds, setLayerIds] = useState<string[]>(initialData.layerIds);
  const [camera, setCamera] = useState<Camera>(initialData.camera || { x: 0, y: 0, zoom: 1 });
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);
  const [lastColor, setLastColor] = useState<Color>(PRESET_COLORS[0]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ layers: Record<string, Layer>; layerIds: string[] }[]>([
    { layers: initialData.layers, layerIds: initialData.layerIds },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Canvas Mode State
  const [canvasState, setCanvasState] = useState<CanvasState>({ mode: CanvasMode.None });
  const [pencilDraft, setPencilDraft] = useState<number[][] | null>(null);

  // Ref for the interactive canvas viewport container (needed for accurate coordinate mapping)
  const containerRef = useRef<HTMLDivElement>(null);

  // Track newly created text layer to auto-focus
  const pendingFocusLayerId = useRef<string | null>(null);

  // Auto-save debounce state
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = useRef(false);

  // Push history entry
  const recordHistory = useCallback(
    (newLayers: Record<string, Layer>, newLayerIds: string[]) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        return [...next, { layers: newLayers, layerIds: newLayerIds }];
      });
      setHistoryIndex((prev) => prev + 1);
      isDirty.current = true;
    },
    [historyIndex]
  );

  const undo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLayers(prev.layers);
      setLayerIds(prev.layerIds);
      setHistoryIndex(historyIndex - 1);
      setSelectedLayerIds([]);
      isDirty.current = true;
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLayers(next.layers);
      setLayerIds(next.layerIds);
      setHistoryIndex(historyIndex + 1);
      setSelectedLayerIds([]);
      isDirty.current = true;
    }
  };

  // Auto-focus newly created text layers
  useEffect(() => {
    if (pendingFocusLayerId.current) {
      const id = pendingFocusLayerId.current;
      pendingFocusLayerId.current = null;
      // Small delay to let React render the foreignObject
      requestAnimationFrame(() => {
        const el = document.querySelector(`[data-layer-id="${id}"] textarea`) as HTMLTextAreaElement;
        if (el) {
          el.focus();
          el.setSelectionRange(0, 0);
        }
      });
    }
  });

  // Auto-save to SQLite every 1.5 seconds when dirty
  useEffect(() => {
    const timer = setInterval(async () => {
      if (isDirty.current) {
        isDirty.current = false;
        setIsSaving(true);
        try {
          const payload = JSON.stringify({ layers, layerIds, camera });
          await tauriApi.saveWhiteboardCanvas(whiteboard.id, payload);
        } catch {
          // Silent retry
        } finally {
          setIsSaving(false);
        }
      }
    }, 1200);

    return () => clearInterval(timer);
  }, [layers, layerIds, camera, whiteboard.id]);

  // Insert standard shape / note / text
  const insertLayer = (
    layerType: LayerType.Rectangle | LayerType.Ellipse | LayerType.Text | LayerType.Note,
    point: Point
  ) => {
    const layerId = "layer_" + Math.random().toString(36).substring(2, 9);
    let newLayer: Layer;

    if (layerType === LayerType.Rectangle) {
      newLayer = {
        type: LayerType.Rectangle,
        x: point.x - 50,
        y: point.y - 50,
        width: 120,
        height: 100,
        fill: lastColor,
      };
    } else if (layerType === LayerType.Ellipse) {
      newLayer = {
        type: LayerType.Ellipse,
        x: point.x - 50,
        y: point.y - 50,
        width: 120,
        height: 120,
        fill: lastColor,
      };
    } else if (layerType === LayerType.Note) {
      newLayer = {
        type: LayerType.Note,
        x: point.x - 60,
        y: point.y - 60,
        width: 140,
        height: 140,
        fill: { r: 254, g: 240, b: 138 }, // Sticky note yellow
        value: "NOTE...",
      };
    } else {
      newLayer = {
        type: LayerType.Text,
        x: point.x,
        y: point.y - 14,
        width: 200,
        height: 36,
        fill: lastColor,
        value: "",
        fontSize: 20,
      };
    }

    const updatedLayers = { ...layers, [layerId]: newLayer };
    const updatedIds = [...layerIds, layerId];

    setLayers(updatedLayers);
    setLayerIds(updatedIds);
    setSelectedLayerIds([layerId]);
    recordHistory(updatedLayers, updatedIds);
    setCanvasState({ mode: CanvasMode.None });

    // Schedule auto-focus for text layers
    if (layerType === LayerType.Text) {
      pendingFocusLayerId.current = layerId;
    }
  };

  // Middle-click and spacebar canvas panning
  const isMiddlePanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  const onPointerDown = (e: React.PointerEvent) => {
    // Middle click pan (button 1)
    if (e.button === 1 || e.buttons === 4) {
      e.preventDefault();
      isMiddlePanning.current = true;
      panStart.current = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y };
      return;
    }

    const point = pointerEventToCanvasPoint(e, camera, camera.zoom, containerRef.current);

    if (canvasState.mode === CanvasMode.Inserting) {
      insertLayer(canvasState.layerType, point);
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil) {
      setPencilDraft([[point.x, point.y, e.pressure || 0.5]]);
      return;
    }

    setCanvasState({ origin: point, mode: CanvasMode.Pressing });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isMiddlePanning.current) {
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setCamera((prev) => ({ ...prev, x: panStart.current.camX + dx, y: panStart.current.camY + dy }));
      isDirty.current = true;
      return;
    }

    const current = pointerEventToCanvasPoint(e, camera, camera.zoom, containerRef.current);

    if (canvasState.mode === CanvasMode.Pressing) {
      // Start selection net
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin: canvasState.origin,
        current,
      });
      return;
    }

    if (canvasState.mode === CanvasMode.SelectionNet) {
      const intersecting = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        canvasState.origin,
        current
      );
      setSelectedLayerIds(intersecting);
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin: canvasState.origin,
        current,
      });
      return;
    }

    if (canvasState.mode === CanvasMode.Translating) {
      const dx = current.x - canvasState.current.x;
      const dy = current.y - canvasState.current.y;

      const updated = { ...layers };
      for (const id of selectedLayerIds) {
        const layer = updated[id];
        if (layer) {
          updated[id] = { ...layer, x: layer.x + dx, y: layer.y + dy };
        }
      }

      setLayers(updated);
      setCanvasState({ mode: CanvasMode.Translating, current });
      isDirty.current = true;
      return;
    }

    if (canvasState.mode === CanvasMode.Resizing) {
      const bounds = resizeBounds(canvasState.initialBounds, canvasState.corner, current);
      const updated = { ...layers };
      for (const id of selectedLayerIds) {
        const layer = updated[id];
        if (layer) {
          updated[id] = {
            ...layer,
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          };
        }
      }
      setLayers(updated);
      isDirty.current = true;
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil) {
      if (pencilDraft) {
        setPencilDraft([...pencilDraft, [current.x, current.y, e.pressure || 0.5]]);
      }
    }
  };

  const onPointerUp = () => {
    if (isMiddlePanning.current) {
      isMiddlePanning.current = false;
      return;
    }

    if (canvasState.mode === CanvasMode.Pencil && pencilDraft && pencilDraft.length > 1) {
      const layerId = "pen_" + Math.random().toString(36).substring(2, 9);
      const newPath = penPointsToPathLayer(pencilDraft, lastColor);

      const updatedLayers = { ...layers, [layerId]: newPath };
      const updatedIds = [...layerIds, layerId];

      setLayers(updatedLayers);
      setLayerIds(updatedIds);
      setPencilDraft(null);
      recordHistory(updatedLayers, updatedIds);
      return;
    }

    if (canvasState.mode === CanvasMode.Translating || canvasState.mode === CanvasMode.Resizing) {
      recordHistory(layers, layerIds);
    }

    // If user clicked empty canvas without dragging (Pressing → didn't become SelectionNet),
    // clear selection
    if (canvasState.mode === CanvasMode.Pressing) {
      setSelectedLayerIds([]);
    }

    setPencilDraft(null);
    setCanvasState({ mode: CanvasMode.None });
  };

  // Wheel zoom / pan
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(3, Math.max(0.2, camera.zoom * zoomFactor));
      setCamera((prev) => ({ ...prev, zoom: newZoom }));
      isDirty.current = true;
    } else {
      setCamera((prev) => ({
        ...prev,
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY,
      }));
      isDirty.current = true;
    }
  };

  // Keyboard shortcuts (Del to delete, Ctrl+Z to undo, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const activeTag = (document.activeElement as HTMLElement)?.tagName;
        if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

        if (selectedLayerIds.length > 0) {
          const updatedLayers = { ...layers };
          for (const id of selectedLayerIds) {
            delete updatedLayers[id];
          }
          const updatedIds = layerIds.filter((id) => !selectedLayerIds.includes(id));
          setLayers(updatedLayers);
          setLayerIds(updatedIds);
          setSelectedLayerIds([]);
          recordHistory(updatedLayers, updatedIds);
          toast.success(`Deleted ${selectedLayerIds.length} element(s)`);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedLayerIds, layers, layerIds, historyIndex, history]);

  // Selected bounding box calculation
  const selectionBoundingBox: XYWH | null = (() => {
    if (selectedLayerIds.length === 0) return null;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const id of selectedLayerIds) {
      const layer = layers[id];
      if (!layer) continue;
      minX = Math.min(minX, layer.x);
      minY = Math.min(minY, layer.y);
      maxX = Math.max(maxX, layer.x + layer.width);
      maxY = Math.max(maxY, layer.y + layer.height);
    }

    if (minX === Infinity) return null;
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  })();

  const updateSelectedColor = (color: Color) => {
    setLastColor(color);
    if (selectedLayerIds.length > 0) {
      const updated = { ...layers };
      for (const id of selectedLayerIds) {
        if (updated[id]) {
          updated[id] = { ...updated[id], fill: color };
        }
      }
      setLayers(updated);
      recordHistory(updated, layerIds);
    }
  };

  const deleteSelected = () => {
    if (selectedLayerIds.length === 0) return;
    const updatedLayers = { ...layers };
    for (const id of selectedLayerIds) {
      delete updatedLayers[id];
    }
    const updatedIds = layerIds.filter((id) => !selectedLayerIds.includes(id));
    setLayers(updatedLayers);
    setLayerIds(updatedIds);
    setSelectedLayerIds([]);
    recordHistory(updatedLayers, updatedIds);
  };

  const bringToFront = () => {
    if (selectedLayerIds.length === 0) return;
    const filtered = layerIds.filter((id) => !selectedLayerIds.includes(id));
    const newOrder = [...filtered, ...selectedLayerIds];
    setLayerIds(newOrder);
    recordHistory(layers, newOrder);
  };

  const sendToBack = () => {
    if (selectedLayerIds.length === 0) return;
    const filtered = layerIds.filter((id) => !selectedLayerIds.includes(id));
    const newOrder = [...selectedLayerIds, ...filtered];
    setLayerIds(newOrder);
    recordHistory(layers, newOrder);
  };

  return (
    <div className="relative w-full h-full bg-[#FAFAFA] dark:bg-[#09090B] overflow-hidden select-none touch-none">
      {/* Background Dots Pattern */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-25">
        <defs>
          <pattern
            id="grid-dots"
            x={camera.x % (24 * camera.zoom)}
            y={camera.y % (24 * camera.zoom)}
            width={24 * camera.zoom}
            height={24 * camera.zoom}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" className="fill-zinc-400 dark:fill-zinc-600" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Top Header Navbar */}
      <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-x-2 pointer-events-auto bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 px-3 shadow-md rounded-none">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-x-1.5 font-mono text-xs font-semibold text-[#09090B] dark:text-white hover:text-rose-600 transition-colors p-1"
            title="Back to Whiteboards"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">WHITEBOARDS</span>
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-mono text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider truncate max-w-[200px]">
            {whiteboard.title}
          </span>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
            {isSaving ? "Saving..." : "SQLite Synced"}
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-x-1 pointer-events-auto bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 shadow-md rounded-none">
          <button
            type="button"
            onClick={() => setCamera((c) => ({ ...c, zoom: Math.max(0.2, c.zoom - 0.1) }))}
            className="p-1 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold text-[#09090B] dark:text-white w-12 text-center">
            {Math.round(camera.zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setCamera((c) => ({ ...c, zoom: Math.min(3, c.zoom + 0.1) }))}
            className="p-1 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}
            className="p-1 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors"
            title="Reset Canvas View"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Brutalist Tool Palette (Left or Center) */}
      <div className="absolute top-16 left-3 z-40 flex flex-col gap-y-1.5 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 shadow-xl rounded-none">
        <button
          type="button"
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.None || canvasState.mode === CanvasMode.Translating
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Select / Move (V)"
        >
          <MousePointer className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Rectangle })
          }
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Rectangle (R)"
        >
          <Square className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Ellipse })
          }
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Ellipse (O)"
        >
          <Circle className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Note })
          }
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Note
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Sticky Note (N)"
        >
          <StickyNote className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            setCanvasState({ mode: CanvasMode.Inserting, layerType: LayerType.Text })
          }
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Text
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Text Label (T)"
        >
          <Type className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setCanvasState({ mode: CanvasMode.Pencil })}
          className={`p-2 transition-colors rounded-none ${
            canvasState.mode === CanvasMode.Pencil
              ? "bg-black dark:bg-white text-white dark:text-black"
              : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
          }`}
          title="Freehand Pencil (P)"
        >
          <Pencil className="h-4 w-4" />
        </button>

        <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />

        <button
          type="button"
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-2 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] disabled:opacity-30 transition-colors rounded-none"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="p-2 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B] disabled:opacity-30 transition-colors rounded-none"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      {/* Contextual Properties Bar for Selected Elements */}
      {selectedLayerIds.length > 0 && selectionBoundingBox && (
        <div
          className="absolute z-40 flex items-center gap-x-2 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-2 shadow-2xl rounded-none pointer-events-auto"
          style={{
            transform: `translate(${Math.max(80, selectionBoundingBox.x * camera.zoom + camera.x)}px, ${Math.max(70, (selectionBoundingBox.y - 50) * camera.zoom + camera.y)}px)`,
          }}
        >
          {/* Color Palette */}
          <div className="flex items-center gap-x-1 border-r border-zinc-200 dark:border-zinc-800 pr-2">
            {PRESET_COLORS.map((col, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateSelectedColor(col)}
                className="w-5 h-5 rounded-none border border-black/20 dark:border-white/20 transition-transform hover:scale-110"
                style={{ backgroundColor: colorToCss(col) }}
              />
            ))}
          </div>

          {/* Font Size Controls — only for Text layers */}
          {selectedLayerIds.length === 1 && layers[selectedLayerIds[0]]?.type === LayerType.Text && (
            <div className="flex items-center gap-x-1 border-r border-zinc-200 dark:border-zinc-800 pr-2">
              <span className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase mr-1">Size</span>
              {FONT_SIZES.map((size) => {
                const selectedLayer = layers[selectedLayerIds[0]];
                const currentSize = selectedLayer && 'fontSize' in selectedLayer ? (selectedLayer as any).fontSize || 20 : 20;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      const updated = { ...layers };
                      const id = selectedLayerIds[0];
                      if (updated[id] && updated[id].type === LayerType.Text) {
                        updated[id] = { ...updated[id], fontSize: size } as Layer;
                      }
                      setLayers(updated);
                      recordHistory(updated, layerIds);
                    }}
                    className={`px-1.5 py-0.5 font-mono text-[10px] rounded-none transition-colors ${
                      currentSize === size
                        ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                        : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          )}

          {/* Layer Ordering */}
          <button
            type="button"
            onClick={bringToFront}
            className="p-1.5 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors"
            title="Bring to Front"
          >
            <BringToFront className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={sendToBack}
            className="p-1.5 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors"
            title="Send to Back"
          >
            <SendToBack className="h-4 w-4" />
          </button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Delete */}
          <button
            type="button"
            onClick={deleteSelected}
            className="p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Delete (Del)"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Interactive Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-crosshair overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* Render Layers in Order */}
          {layerIds.map((layerId) => {
            const layer = layers[layerId];
            if (!layer) return null;
            const isSelected = selectedLayerIds.includes(layerId);

            const handleLayerPointerDown = (e: React.PointerEvent) => {
              if (canvasState.mode === CanvasMode.Inserting || canvasState.mode === CanvasMode.Pencil) return;
              e.stopPropagation();
              const point = pointerEventToCanvasPoint(e, camera, camera.zoom, containerRef.current);

              if (e.shiftKey) {
                setSelectedLayerIds((prev) =>
                  prev.includes(layerId) ? prev.filter((id) => id !== layerId) : [...prev, layerId]
                );
              } else if (!isSelected) {
                setSelectedLayerIds([layerId]);
              }

              setCanvasState({ mode: CanvasMode.Translating, current: point });
            };

            if (layer.type === LayerType.Rectangle) {
              return (
                <rect
                  key={layerId}
                  x={layer.x}
                  y={layer.y}
                  width={layer.width}
                  height={layer.height}
                  fill={colorToCss(layer.fill)}
                  stroke={isSelected ? "#2563EB" : "#27272A"}
                  strokeWidth={isSelected ? 2 / camera.zoom : 1}
                  onPointerDown={handleLayerPointerDown}
                  className="cursor-pointer transition-shadow"
                />
              );
            }

            if (layer.type === LayerType.Ellipse) {
              return (
                <ellipse
                  key={layerId}
                  cx={layer.x + layer.width / 2}
                  cy={layer.y + layer.height / 2}
                  rx={layer.width / 2}
                  ry={layer.height / 2}
                  fill={colorToCss(layer.fill)}
                  stroke={isSelected ? "#2563EB" : "#27272A"}
                  strokeWidth={isSelected ? 2 / camera.zoom : 1}
                  onPointerDown={handleLayerPointerDown}
                  className="cursor-pointer"
                />
              );
            }

            if (layer.type === LayerType.Note) {
              return (
                <g
                  key={layerId}
                  transform={`translate(${layer.x}, ${layer.y})`}
                  onPointerDown={handleLayerPointerDown}
                  className="cursor-pointer"
                >
                  <rect
                    width={layer.width}
                    height={layer.height}
                    fill={colorToCss(layer.fill)}
                    stroke={isSelected ? "#2563EB" : "rgba(0,0,0,0.15)"}
                    strokeWidth={isSelected ? 2 / camera.zoom : 1}
                    className="drop-shadow-md"
                  />
                  <foreignObject width={layer.width} height={layer.height}>
                    <div
                      style={{ backgroundColor: colorToCss(layer.fill), width: "100%", height: "100%" }}
                    >
                      <textarea
                        value={layer.value || ""}
                        onChange={(e) => {
                          const updated = {
                            ...layers,
                            [layerId]: { ...layer, value: e.target.value },
                          };
                          setLayers(updated);
                          isDirty.current = true;
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full h-full p-3 font-sans text-xs bg-transparent resize-none border-none outline-none font-semibold"
                        style={{ color: getContrastingTextColor(layer.fill) }}
                        placeholder="Type note..."
                      />
                    </div>
                  </foreignObject>
                </g>
              );
            }

            if (layer.type === LayerType.Text) {
              const fontSize = layer.fontSize || 20;
              return (
                <g
                  key={layerId}
                  data-layer-id={layerId}
                  transform={`translate(${layer.x}, ${layer.y})`}
                  onPointerDown={handleLayerPointerDown}
                  className="cursor-pointer"
                >
                  <foreignObject
                    width={layer.width}
                    height={layer.height}
                    style={{ overflow: "visible" }}
                  >
                    <textarea
                      value={layer.value || ""}
                      onChange={(e) => {
                        const updated = {
                          ...layers,
                          [layerId]: { ...layer, value: e.target.value },
                        };
                        setLayers(updated);
                        isDirty.current = true;
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      placeholder="Type here..."
                      style={{
                        color: colorToCss(layer.fill),
                        backgroundColor: "transparent",
                        outline: "none",
                        border: "none",
                        resize: "none",
                        fontFamily: "ui-monospace, SFMono-Regular, monospace",
                        fontSize: `${fontSize}px`,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        width: `${layer.width}px`,
                        minHeight: `${layer.height}px`,
                        padding: "4px 2px",
                        lineHeight: "1.3",
                        caretColor: colorToCss(layer.fill),
                        direction: "ltr",
                        textAlign: "left",
                      }}
                    />
                  </foreignObject>
                </g>
              );
            }

            if (layer.type === LayerType.Path) {
              const stroke = getStroke(layer.points, {
                size: 10,
                thinning: 0.5,
                smoothing: 0.5,
                streamline: 0.5,
              });
              const pathData = getSvgPathFromStroke(stroke);

              return (
                <path
                  key={layerId}
                  d={pathData}
                  transform={`translate(${layer.x}, ${layer.y})`}
                  fill={colorToCss(layer.fill)}
                  stroke={isSelected ? "#2563EB" : "transparent"}
                  strokeWidth={isSelected ? 2 / camera.zoom : 0}
                  onPointerDown={handleLayerPointerDown}
                  className="cursor-pointer"
                />
              );
            }

            return null;
          })}

          {/* Active Pencil Draft */}
          {pencilDraft && (
            <path
              d={getSvgPathFromStroke(
                getStroke(pencilDraft, {
                  size: 10,
                  thinning: 0.5,
                  smoothing: 0.5,
                  streamline: 0.5,
                })
              )}
              fill={colorToCss(lastColor)}
            />
          )}

          {/* Selection Box & Resize Handles */}
          {selectionBoundingBox && (
            <g>
              <rect
                x={selectionBoundingBox.x}
                y={selectionBoundingBox.y}
                width={selectionBoundingBox.width}
                height={selectionBoundingBox.height}
                fill="none"
                stroke="#2563EB"
                strokeWidth={1.5 / camera.zoom}
                strokeDasharray="4 4"
                className="pointer-events-none"
              />

              {/* 8 Resize Handles */}
              {[
                { corner: Side.Top + Side.Left, x: selectionBoundingBox.x, y: selectionBoundingBox.y, cursor: "nwse-resize" },
                { corner: Side.Top, x: selectionBoundingBox.x + selectionBoundingBox.width / 2, y: selectionBoundingBox.y, cursor: "ns-resize" },
                { corner: Side.Top + Side.Right, x: selectionBoundingBox.x + selectionBoundingBox.width, y: selectionBoundingBox.y, cursor: "nesw-resize" },
                { corner: Side.Right, x: selectionBoundingBox.x + selectionBoundingBox.width, y: selectionBoundingBox.y + selectionBoundingBox.height / 2, cursor: "ew-resize" },
                { corner: Side.Bottom + Side.Right, x: selectionBoundingBox.x + selectionBoundingBox.width, y: selectionBoundingBox.y + selectionBoundingBox.height, cursor: "nwse-resize" },
                { corner: Side.Bottom, x: selectionBoundingBox.x + selectionBoundingBox.width / 2, y: selectionBoundingBox.y + selectionBoundingBox.height, cursor: "ns-resize" },
                { corner: Side.Bottom + Side.Left, x: selectionBoundingBox.x, y: selectionBoundingBox.y + selectionBoundingBox.height, cursor: "nesw-resize" },
                { corner: Side.Left, x: selectionBoundingBox.x, y: selectionBoundingBox.y + selectionBoundingBox.height / 2, cursor: "ew-resize" },
              ].map((h, i) => {
                const handleSize = 8 / camera.zoom;
                return (
                  <rect
                    key={i}
                    x={h.x - handleSize / 2}
                    y={h.y - handleSize / 2}
                    width={handleSize}
                    height={handleSize}
                    fill="#FFFFFF"
                    stroke="#2563EB"
                    strokeWidth={1.5 / camera.zoom}
                    style={{ cursor: h.cursor }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setCanvasState({
                        mode: CanvasMode.Resizing,
                        initialBounds: selectionBoundingBox,
                        corner: h.corner,
                      });
                    }}
                  />
                );
              })}
            </g>
          )}

          {/* Marquee Selection Net */}
          {canvasState.mode === CanvasMode.SelectionNet && canvasState.current && (
            <rect
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
              fill="rgba(37, 99, 235, 0.15)"
              stroke="#2563EB"
              strokeWidth={1 / camera.zoom}
              className="pointer-events-none"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
