import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { toast } from "sonner";

import {
  Camera,
  CanvasMode,
  CanvasState,
  Color,
  Layer,
  LayerType,
  Point,
  Side,
  Whiteboard,
  WhiteboardCanvasData,
  XYWH,
} from "@/types/whiteboard";
import { tauriApi } from "@/lib/tauri";
import {
  boundingBox,
  colorToCss,
  findIntersectingLayersWithRectangle,
  penPointsToPathLayer,
  pointerEventToCanvasPoint,
  resizeBounds,
} from "@/lib/whiteboard-utils";

import { LayerPreview } from "./layer-preview";
import { SelectionBox } from "./selection-box";
import { SelectionTools } from "./selection-tools";
import { Toolbar } from "./toolbar";
import { Path } from "./path";

const MAX_LAYERS = 200;

interface WhiteboardCanvasProps {
  whiteboard: Whiteboard;
  onBack: () => void;
}

export const WhiteboardCanvas = ({ whiteboard, onBack }: WhiteboardCanvasProps) => {
  // Parse initial canvas data
  const initialData: WhiteboardCanvasData = useMemo(() => {
    try {
      const parsed = JSON.parse(whiteboard.canvas_data);
      return {
        layers: parsed.layers || {},
        layerIds: parsed.layerIds || [],
        camera: parsed.camera || { x: 0, y: 0 },
      };
    } catch {
      return { layers: {}, layerIds: [], camera: { x: 0, y: 0 } };
    }
  }, [whiteboard.canvas_data]);

  const [layers, setLayers] = useState<Record<string, Layer>>(initialData.layers);
  const [layerIds, setLayerIds] = useState<string[]>(initialData.layerIds);
  const [camera, setCamera] = useState<Camera>(initialData.camera || { x: 0, y: 0 });
  const [selection, setSelection] = useState<string[]>([]);
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 243,
    g: 82,
    b: 35,
  });

  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  const [pencilDraft, setPencilDraft] = useState<number[][] | null>(null);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<{ layers: Record<string, Layer>; layerIds: string[] }[]>([
    { layers: initialData.layers, layerIds: initialData.layerIds },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Auto-save debounce state
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

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

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setLayers(prev.layers);
      setLayerIds(prev.layerIds);
      setHistoryIndex((idx) => idx - 1);
      setSelection([]);
      isDirty.current = true;
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setLayers(next.layers);
      setLayerIds(next.layerIds);
      setHistoryIndex((idx) => idx + 1);
      setSelection([]);
      isDirty.current = true;
    }
  }, [history, historyIndex]);

  // Debounced auto-save to SQLite
  useEffect(() => {
    const timer = setInterval(async () => {
      if (isDirty.current) {
        isDirty.current = false;
        setIsSaving(true);
        try {
          const payload = JSON.stringify({ layers, layerIds, camera });
          await tauriApi.saveWhiteboardCanvas(whiteboard.id, payload);
        } catch {
          // Retry on next cycle
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [layers, layerIds, camera, whiteboard.id]);

  // Insert standard layers
  const insertLayer = useCallback(
    (
      layerType: LayerType.Ellipse | LayerType.Rectangle | LayerType.Text | LayerType.Note,
      position: Point
    ) => {
      if (layerIds.length >= MAX_LAYERS) {
        toast.error("Layer limit reached");
        return;
      }

      const layerId = "layer_" + Math.random().toString(36).substring(2, 9);
      let newLayer: Layer;

      if (layerType === LayerType.Rectangle) {
        newLayer = {
          type: LayerType.Rectangle,
          x: position.x - 50,
          y: position.y - 50,
          width: 100,
          height: 100,
          fill: lastUsedColor,
        };
      } else if (layerType === LayerType.Ellipse) {
        newLayer = {
          type: LayerType.Ellipse,
          x: position.x - 50,
          y: position.y - 50,
          width: 100,
          height: 100,
          fill: lastUsedColor,
        };
      } else if (layerType === LayerType.Note) {
        newLayer = {
          type: LayerType.Note,
          x: position.x - 50,
          y: position.y - 50,
          width: 100,
          height: 100,
          fill: { r: 255, g: 249, b: 177 }, // Sticky note yellow
          value: "Text",
        };
      } else {
        newLayer = {
          type: LayerType.Text,
          x: position.x - 50,
          y: position.y - 50,
          width: 100,
          height: 100,
          fill: lastUsedColor,
          value: "Text",
        };
      }

      const updatedLayers = { ...layers, [layerId]: newLayer };
      const updatedIds = [...layerIds, layerId];

      setLayers(updatedLayers);
      setLayerIds(updatedIds);
      setSelection([layerId]);
      recordHistory(updatedLayers, updatedIds);
      setCanvasState({ mode: CanvasMode.None });
    },
    [layerIds, layers, lastUsedColor, recordHistory]
  );

  const translateSelectedLayers = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Translating) return;

      const offset = {
        x: point.x - canvasState.current.x,
        y: point.y - canvasState.current.y,
      };

      const updated = { ...layers };
      for (const id of selection) {
        const layer = updated[id];
        if (layer) {
          updated[id] = {
            ...layer,
            x: layer.x + offset.x,
            y: layer.y + offset.y,
          };
        }
      }

      setLayers(updated);
      setCanvasState({ mode: CanvasMode.Translating, current: point });
      isDirty.current = true;
    },
    [canvasState, layers, selection]
  );

  const unselectLayers = useCallback(() => {
    if (selection.length > 0) {
      setSelection([]);
    }
  }, [selection]);

  const updateSelectionNet = useCallback(
    (current: Point, origin: Point) => {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });

      const ids = findIntersectingLayersWithRectangle(
        layerIds,
        layers,
        origin,
        current
      );

      setSelection(ids);
    },
    [layerIds, layers]
  );

  const startMultiSelection = useCallback((current: Point, origin: Point) => {
    if (Math.abs(current.x - origin.x) + Math.abs(current.y - origin.y) > 5) {
      setCanvasState({
        mode: CanvasMode.SelectionNet,
        origin,
        current,
      });
    }
  }, []);

  const continueDrawing = useCallback(
    (point: Point, e: React.PointerEvent) => {
      if (
        canvasState.mode !== CanvasMode.Pencil ||
        e.buttons !== 1 ||
        pencilDraft == null
      ) {
        return;
      }

      setPencilDraft(
        pencilDraft.length === 1 &&
          pencilDraft[0][0] === point.x &&
          pencilDraft[0][1] === point.y
          ? pencilDraft
          : [...pencilDraft, [point.x, point.y, e.pressure || 0.5]]
      );
    },
    [canvasState.mode, pencilDraft]
  );

  const insertPath = useCallback(() => {
    if (
      pencilDraft == null ||
      pencilDraft.length < 2 ||
      layerIds.length >= MAX_LAYERS
    ) {
      setPencilDraft(null);
      return;
    }

    const layerId = "pen_" + Math.random().toString(36).substring(2, 9);
    const newPath = penPointsToPathLayer(pencilDraft, lastUsedColor);

    const updatedLayers = { ...layers, [layerId]: newPath };
    const updatedIds = [...layerIds, layerId];

    setLayers(updatedLayers);
    setLayerIds(updatedIds);
    setPencilDraft(null);
    recordHistory(updatedLayers, updatedIds);
    setCanvasState({ mode: CanvasMode.Pencil });
  }, [pencilDraft, layerIds, layers, lastUsedColor, recordHistory]);

  const startDrawing = useCallback(
    (point: Point, pressure: number) => {
      setPencilDraft([[point.x, point.y, pressure]]);
    },
    []
  );

  const resizeSelectedLayer = useCallback(
    (point: Point) => {
      if (canvasState.mode !== CanvasMode.Resizing) return;

      const bounds = resizeBounds(
        canvasState.initialBounds,
        canvasState.corner,
        point
      );

      const targetId = selection[0];
      if (targetId && layers[targetId]) {
        const updated = {
          ...layers,
          [targetId]: {
            ...layers[targetId],
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
          },
        };
        setLayers(updated);
        isDirty.current = true;
      }
    },
    [canvasState, layers, selection]
  );

  const onResizeHandlePointerDown = useCallback(
    (corner: Side, initialBounds: XYWH) => {
      setCanvasState({
        mode: CanvasMode.Resizing,
        initialBounds,
        corner,
      });
    },
    []
  );

  // Wheel Panning
  const onWheel = useCallback((e: React.WheelEvent) => {
    setCamera((prev) => ({
      x: prev.x - e.deltaX,
      y: prev.y - e.deltaY,
    }));
    isDirty.current = true;
  }, []);

  // Middle-click Pan support
  const isMiddlePanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, camX: 0, camY: 0 });

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isMiddlePanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setCamera({ x: panStart.current.camX + dx, y: panStart.current.camY + dy });
        isDirty.current = true;
        return;
      }

      e.preventDefault();
      const current = pointerEventToCanvasPoint(e, camera, containerRef.current);

      if (canvasState.mode === CanvasMode.Pressing) {
        startMultiSelection(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.SelectionNet) {
        updateSelectionNet(current, canvasState.origin);
      } else if (canvasState.mode === CanvasMode.Translating) {
        translateSelectedLayers(current);
      } else if (canvasState.mode === CanvasMode.Resizing) {
        resizeSelectedLayer(current);
      } else if (canvasState.mode === CanvasMode.Pencil) {
        continueDrawing(current, e);
      }
    },
    [
      camera,
      canvasState,
      continueDrawing,
      resizeSelectedLayer,
      startMultiSelection,
      translateSelectedLayers,
      updateSelectionNet,
    ]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Middle click pan
      if (e.button === 1 || e.buttons === 4) {
        e.preventDefault();
        isMiddlePanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, camX: camera.x, camY: camera.y };
        return;
      }

      const point = pointerEventToCanvasPoint(e, camera, containerRef.current);

      if (canvasState.mode === CanvasMode.Inserting) {
        return;
      }

      if (canvasState.mode === CanvasMode.Pencil) {
        startDrawing(point, e.pressure || 0.5);
        return;
      }

      setCanvasState({ origin: point, mode: CanvasMode.Pressing });
    },
    [camera, canvasState.mode, startDrawing]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isMiddlePanning.current) {
        isMiddlePanning.current = false;
        return;
      }

      const point = pointerEventToCanvasPoint(e, camera, containerRef.current);

      if (
        canvasState.mode === CanvasMode.None ||
        canvasState.mode === CanvasMode.Pressing
      ) {
        unselectLayers();
        setCanvasState({
          mode: CanvasMode.None,
        });
      } else if (canvasState.mode === CanvasMode.Pencil) {
        insertPath();
      } else if (canvasState.mode === CanvasMode.Inserting) {
        insertLayer(canvasState.layerType, point);
      } else {
        if (canvasState.mode === CanvasMode.Translating || canvasState.mode === CanvasMode.Resizing) {
          recordHistory(layers, layerIds);
        }
        setCanvasState({
          mode: CanvasMode.None,
        });
      }
    },
    [camera, canvasState, insertLayer, insertPath, layers, layerIds, recordHistory, unselectLayers]
  );

  const onLayerPointerDown = useCallback(
    (e: React.PointerEvent, layerId: string) => {
      if (
        canvasState.mode === CanvasMode.Pencil ||
        canvasState.mode === CanvasMode.Inserting
      ) {
        return;
      }

      e.stopPropagation();

      const point = pointerEventToCanvasPoint(e, camera, containerRef.current);

      if (!selection.includes(layerId)) {
        setSelection([layerId]);
      }
      setCanvasState({ mode: CanvasMode.Translating, current: point });
    },
    [camera, canvasState.mode, selection]
  );

  // Update text or note inline value
  const updateLayerValue = useCallback(
    (id: string, value: string) => {
      setLayers((prev) => {
        if (!prev[id]) return prev;
        const updated = {
          ...prev,
          [id]: { ...prev[id], value },
        };
        isDirty.current = true;
        return updated;
      });
    },
    []
  );

  // Calculate selection bounds
  const selectionBounds = useMemo(() => {
    const selectedLayers = selection
      .map((id) => layers[id])
      .filter(Boolean);

    return boundingBox(selectedLayers);
  }, [layers, selection]);

  // Contextual toolbar actions
  const moveToFront = useCallback(() => {
    const indices: number[] = [];
    for (let i = 0; i < layerIds.length; i++) {
      if (selection.includes(layerIds[i])) {
        indices.push(i);
      }
    }

    const filtered = layerIds.filter((id) => !selection.includes(id));
    const newOrder = [...filtered, ...selection];
    setLayerIds(newOrder);
    recordHistory(layers, newOrder);
  }, [layerIds, layers, recordHistory, selection]);

  const moveToBack = useCallback(() => {
    const filtered = layerIds.filter((id) => !selection.includes(id));
    const newOrder = [...selection, ...filtered];
    setLayerIds(newOrder);
    recordHistory(layers, newOrder);
  }, [layerIds, layers, recordHistory, selection]);

  const setFill = useCallback(
    (fill: Color) => {
      setLastUsedColor(fill);
      const updated = { ...layers };
      for (const id of selection) {
        if (updated[id]) {
          updated[id] = { ...updated[id], fill };
        }
      }
      setLayers(updated);
      recordHistory(updated, layerIds);
    },
    [layerIds, layers, recordHistory, selection]
  );

  const deleteLayers = useCallback(() => {
    const updated = { ...layers };
    for (const id of selection) {
      delete updated[id];
    }
    const newIds = layerIds.filter((id) => !selection.includes(id));
    setLayers(updated);
    setLayerIds(newIds);
    setSelection([]);
    recordHistory(updated, newIds);
  }, [layerIds, layers, recordHistory, selection]);

  // Keyboard Shortcuts (Delete, Backspace, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || (document.activeElement as HTMLElement)?.isContentEditable) {
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selection.length > 0) {
          deleteLayers();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteLayers, undo, redo, selection]);

  return (
    <main
      ref={containerRef}
      className="h-full w-full relative bg-[#FAFAFA] dark:bg-[#09090B] touch-none overflow-hidden select-none"
    >
      {/* Top Navbar */}
      <div className="absolute top-3 left-3 z-40 flex items-center gap-x-2 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-2 px-3 shadow-md rounded-none">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-x-1.5 font-mono text-xs font-semibold text-[#09090B] dark:text-white hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
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

      {/* View Reset Tool */}
      <div className="absolute top-3 right-3 z-40 flex items-center gap-x-1 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 shadow-md rounded-none">
        <button
          type="button"
          onClick={() => setCamera({ x: 0, y: 0 })}
          className="p-1 text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white transition-colors cursor-pointer"
          title="Reset Canvas View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Floating Toolbar */}
      <Toolbar
        canvasState={canvasState}
        setCanvasState={setCanvasState}
        canRedo={canRedo}
        canUndo={canUndo}
        undo={undo}
        redo={redo}
      />

      {/* Floating Selection Tools */}
      <SelectionTools
        camera={camera}
        selectionBounds={selectionBounds}
        setLastUsedColor={setFill}
        onMoveToFront={moveToFront}
        onMoveToBack={moveToBack}
        onDelete={deleteLayers}
      />

      {/* SVG Canvas Viewport */}
      <svg
        className="h-full w-full cursor-crosshair"
        onWheel={onWheel}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <defs>
          <pattern
            id="wb-grid-dots"
            x={camera.x % 24}
            y={camera.y % 24}
            width={24}
            height={24}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" className="fill-zinc-300 dark:fill-zinc-700" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wb-grid-dots)" />

        <g
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px)`,
          }}
        >
          {layerIds.map((layerId) => (
            <LayerPreview
              key={layerId}
              id={layerId}
              layer={layers[layerId]}
              onLayerPointerDown={onLayerPointerDown}
              onValueChange={updateLayerValue}
              selectionColor={selection.includes(layerId) ? "#3b82f6" : undefined}
            />
          ))}

          <SelectionBox
            onResizeHandlePointerDown={onResizeHandlePointerDown}
            bounds={selectionBounds}
            isShowingHandles={canvasState.mode !== CanvasMode.Translating && selection.length === 1}
          />

          {/* Selection Net Box */}
          {canvasState.mode === CanvasMode.SelectionNet && canvasState.current != null && (
            <rect
              className="fill-blue-500/10 stroke-blue-500 stroke-1"
              x={Math.min(canvasState.origin.x, canvasState.current.x)}
              y={Math.min(canvasState.origin.y, canvasState.current.y)}
              width={Math.abs(canvasState.origin.x - canvasState.current.x)}
              height={Math.abs(canvasState.origin.y - canvasState.current.y)}
            />
          )}

          {/* Active Freehand Pencil Draft */}
          {pencilDraft != null && pencilDraft.length > 0 && (
            <Path
              points={pencilDraft}
              fill={colorToCss(lastUsedColor)}
              x={0}
              y={0}
            />
          )}
        </g>
      </svg>
    </main>
  );
};
