import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  X,
  User,
  ShieldCheck,
  Keyboard,
  Info,
  History,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export const AppSettingsModal = ({
  isOpen,
  onClose,
  userName,
  onUpdateUserName,
}: AppSettingsModalProps) => {
  const [callsign, setCallsign] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCallsign(userName);
  }, [userName]);

  if (!isOpen) return null;

  const handleSaveCallsign = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = callsign.trim();
    if (!trimmed) {
      toast.error("Callsign cannot be empty");
      return;
    }
    onUpdateUserName(trimmed);
    setIsSaved(true);
    toast.success(`Callsign updated to "${trimmed}"`);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const shortcuts = [
    { key: "ESC", desc: "Close dialogs or cancel active input" },
    { key: "ENTER", desc: "Submit new card or column" },
    { key: "CLICK + DRAG", desc: "Reorder lists and cards seamlessly" },
    { key: "FILTER", desc: "Filter cards by keyword, status & labels" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] rounded-none shadow-2xl text-[#09090B] dark:text-white flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E4E4E7] dark:border-[#27272A] bg-zinc-50 dark:bg-[#131315]">
          <div>
            <h2 className="font-sans text-xl font-bold tracking-tight text-[#09090B] dark:text-white">
              App Settings
            </h2>
            <p className="font-mono text-[10px] text-[#71717A] dark:text-[#656467] uppercase tracking-wider mt-0.5">
              Global Preferences // Plynk Desktop
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white p-1 transition-colors rounded-none cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* User Callsign */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-x-1.5">
              <User className="h-3.5 w-3.5 text-zinc-500" />
              <span>User Callsign</span>
            </label>
            <form onSubmit={handleSaveCallsign} className="flex items-center gap-x-2">
              <Input
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="ENTER YOUR CALLSIGN..."
                className="flex-1 bg-zinc-50 dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-mono text-xs uppercase h-10 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-none cursor-pointer shrink-0 flex items-center gap-x-1.5"
              >
                {isSaved ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                <span>{isSaved ? "Saved" : "Update"}</span>
              </button>
            </form>
          </div>

          {/* Application Specs */}
          <div className="space-y-2">
            <p className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-x-1.5">
              <Info className="h-3.5 w-3.5 text-zinc-500" />
              <span>Application Specs</span>
            </p>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
                <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Version</p>
                <p className="font-bold text-[#09090B] dark:text-white mt-0.5">v1.0.0 (Release)</p>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
                <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Engine</p>
                <p className="font-bold text-[#09090B] dark:text-white mt-0.5">Tauri v2 + Rust</p>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
                <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Storage</p>
                <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-x-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>100% Offline SQLite</span>
                </p>
              </div>
              <div className="p-2.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
                <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Privacy</p>
                <p className="font-bold text-[#09090B] dark:text-white mt-0.5">Zero Cloud Telemetry</p>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <p className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-x-1.5">
              <Keyboard className="h-3.5 w-3.5 text-zinc-500" />
              <span>Keyboard Shortcuts</span>
            </p>
            <div className="space-y-1.5 font-mono text-xs">
              {shortcuts.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]"
                >
                  <span className="text-[#71717A] dark:text-[#656467] text-[11px]">{s.desc}</span>
                  <kbd className="px-1.5 py-0.5 bg-white dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-bold text-[10px]">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Changelog */}
          <div className="space-y-2">
            <p className="text-xs font-mono font-semibold uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-x-1.5">
              <History className="h-3.5 w-3.5 text-zinc-500" />
              <span>Changelog</span>
            </p>
            <div className="p-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-xs space-y-1">
              <p className="font-bold text-[#09090B] dark:text-white">v1.0.0 — Production Release</p>
              <ul className="text-[#71717A] dark:text-[#656467] text-[11px] space-y-0.5 list-disc list-inside">
                <li>100% offline local embedded SQLite database persistence.</li>
                <li>Pure monochrome Tech-Noir brutalist aesthetic with Dark/Light modes.</li>
                <li>Kanban workspace with multi-attribute filtering (keyword, status, labels).</li>
                <li>Binary snapshot database export & restore.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
