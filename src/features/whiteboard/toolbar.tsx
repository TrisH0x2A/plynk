import { useState, useRef, useEffect } from "react";
import {
  Circle,
  MousePointer2,
  Pencil,
  Redo2,
  Square,
  StickyNote,
  Type,
  Undo2,
  Palette,
  Pipette,
} from "lucide-react";

import { CanvasMode, CanvasState, Color, LayerType } from "@/types/whiteboard";
import { colorToCss, hexToRgb } from "@/lib/whiteboard-utils";
import { ToolButton } from "./tool-button";

const PRESET_PALETTE: Color[] = [
  { r: 244, g: 63, b: 94 },   // Rose Red
  { r: 249, g: 115, b: 22 },  // Orange
  { r: 251, g: 191, b: 36 },  // Amber Yellow
  { r: 52, g: 211, b: 153 },  // Emerald Green
  { r: 56, g: 189, b: 248 },  // Sky Blue
  { r: 99, g: 102, b: 241 },  // Indigo
  { r: 168, g: 85, b: 247 },  // Purple
  { r: 236, g: 72, b: 153 },  // Pink
  { r: 9, g: 9, b: 11 },      // Black
  { r: 255, g: 255, b: 255 },  // White
];

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
  currentColor: Color;
  onColorChange: (color: Color) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Toolbar = ({
  canvasState,
  setCanvasState,
  currentColor,
  onColorChange,
  undo,
  redo,
  canUndo,
  canRedo,
}: ToolbarProps) => {
  const [isColorOpen, setIsColorOpen] = useState(false);
  const colorPanelRef = useRef<HTMLDivElement>(null);

  // Close color palette when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorPanelRef.current && !colorPanelRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    };
    if (isColorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isColorOpen]);

  const currentHex = colorToCss(currentColor);

  return (
    <div
      className="absolute top-[50%] -translate-y-[50%] left-3 flex flex-col gap-y-3 z-40"
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* Main Drawing Tools */}
      <div className="bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 flex gap-y-1 flex-col items-center shadow-xl rounded-none relative">
        <ToolButton
          label="Select (V)"
          icon={MousePointer2}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.None,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.Translating ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Pressing ||
            canvasState.mode === CanvasMode.Resizing
          }
        />
        <ToolButton
          label="Text (T)"
          icon={Type}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Text,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Text
          }
        />
        <ToolButton
          label="Sticky note (N)"
          icon={StickyNote}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Note,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Note
          }
        />
        <ToolButton
          label="Rectangle (R)"
          icon={Square}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Rectangle
          }
        />
        <ToolButton
          label="Ellipse (O)"
          icon={Circle}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={
            canvasState.mode === CanvasMode.Inserting &&
            canvasState.layerType === LayerType.Ellipse
          }
        />
        <ToolButton
          label="Pen (P)"
          icon={Pencil}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Pencil,
            })
          }
          isActive={canvasState.mode === CanvasMode.Pencil}
        />

        <div className="h-px w-full bg-[#E4E4E7] dark:bg-[#27272A] my-1" />

        {/* Live Color Swatch & Trigger */}
        <button
          type="button"
          title="Color Palette"
          onClick={() => setIsColorOpen(!isColorOpen)}
          className={`p-1.5 transition-all rounded-none flex items-center justify-center cursor-pointer relative group ${
            isColorOpen ? "ring-2 ring-black dark:ring-white" : ""
          }`}
        >
          <div
            className="w-5 h-5 rounded-none border border-black/30 dark:border-white/30 shadow-inner group-hover:scale-110 transition-transform"
            style={{ backgroundColor: currentHex }}
          />
        </button>

        {/* Flyout Color Palette */}
        {isColorOpen && (
          <div
            ref={colorPanelRef}
            className="absolute left-[54px] top-28 bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-3 shadow-2xl rounded-none w-48 z-50 flex flex-col gap-y-2.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b border-[#E4E4E7] dark:border-[#27272A] pb-1.5">
              <span className="font-mono text-[11px] font-bold text-[#09090B] dark:text-white uppercase tracking-wider flex items-center gap-x-1.5">
                <Palette className="h-3.5 w-3.5" />
                <span>Color Palette</span>
              </span>
              <span className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase">
                {currentHex}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_PALETTE.map((col, idx) => {
                const hex = colorToCss(col);
                const isSelected = hex.toLowerCase() === currentHex.toLowerCase();
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onColorChange(col)}
                    className={`w-7 h-7 rounded-none border transition-all cursor-pointer relative p-0 ${
                      isSelected
                        ? "border-black dark:border-white scale-110 shadow-md ring-1 ring-black dark:ring-white z-10"
                        : "border-black/20 dark:border-white/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>

            {/* Custom Color Input */}
            <div className="flex items-center gap-x-2 pt-1 border-t border-[#E4E4E7] dark:border-[#27272A]">
              <div className="relative flex items-center justify-center w-7 h-7 border border-[#E4E4E7] dark:border-[#27272A] cursor-pointer overflow-hidden group">
                <input
                  type="color"
                  value={currentHex}
                  onChange={(e) => onColorChange(hexToRgb(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Pipette className="h-3.5 w-3.5 text-[#71717A] dark:text-[#656467] group-hover:text-black dark:group-hover:text-white transition-colors" />
              </div>
              <span className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
                Custom Color
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="bg-white dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] p-1.5 flex flex-col gap-y-1 items-center shadow-xl rounded-none">
        <ToolButton
          label="Undo (Ctrl+Z)"
          icon={Undo2}
          onClick={undo}
          isDisabled={!canUndo}
        />
        <ToolButton
          label="Redo (Ctrl+Y)"
          icon={Redo2}
          onClick={redo}
          isDisabled={!canRedo}
        />
      </div>
    </div>
  );
};
