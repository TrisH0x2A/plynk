import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  ShieldCheck,
  Keyboard,
  Info,
  History,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface AppSettingsViewProps {
  userName: string;
  onUpdateUserName: (name: string) => void;
}

export const AppSettingsView = ({
  userName,
  onUpdateUserName,
}: AppSettingsViewProps) => {
  const [callsign, setCallsign] = useState(userName);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setCallsign(userName);
  }, [userName]);

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
    { key: "CTRL + T", desc: "Toggle between Dark and Light mode" },
    { key: "CTRL + F", desc: "Open board search and card filter" },
    { key: "CTRL + B", desc: "Jump to Boards overview dashboard" },
    { key: "ENTER", desc: "Submit new card or column" },
    { key: "ESC", desc: "Close dialogs or cancel active input" },
    { key: "MIDDLE CLICK", desc: "Hold & drag to pan board in all directions" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none pb-12">
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#09090B] dark:text-white tracking-tighter mb-1">
          App Settings
        </h2>
        <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
          Global Preferences // Plynk Desktop
        </p>
      </div>

      {/* User Callsign Card */}
      <div className="bg-white dark:bg-[#09090B] p-6 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-x-2 border-b border-[#E4E4E7] dark:border-[#27272A] pb-3">
          <User className="h-4 w-4 text-[#09090B] dark:text-white" />
          <h3 className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white tracking-wider">
            User Callsign
          </h3>
        </div>

        <form onSubmit={handleSaveCallsign} className="flex items-center gap-x-3">
          <Input
            value={callsign}
            onChange={(e) => setCallsign(e.target.value)}
            onBlur={() => {
              const trimmed = callsign.trim();
              if (trimmed && trimmed !== userName) {
                localStorage.setItem("plynk_user_name", trimmed);
                onUpdateUserName(trimmed);
                toast.success(`Callsign updated to "${trimmed}"`);
              }
            }}
            placeholder="ENTER YOUR CALLSIGN..."
            className="flex-1 bg-zinc-50 dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-mono text-xs uppercase h-10 rounded-none focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0"
          />
          <button
            type="submit"
            className="h-10 px-5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors rounded-none cursor-pointer shrink-0 flex items-center gap-x-1.5"
          >
            {isSaved ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            <span>{isSaved ? "Saved" : "Update Callsign"}</span>
          </button>
        </form>
      </div>

      {/* Application Specs */}
      <div className="bg-white dark:bg-[#09090B] p-6 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-x-2 border-b border-[#E4E4E7] dark:border-[#27272A] pb-3">
          <Info className="h-4 w-4 text-[#09090B] dark:text-white" />
          <h3 className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white tracking-wider">
            Application Specs
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
            <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Version</p>
            <p className="font-bold text-[#09090B] dark:text-white mt-0.5">v1.0.0 (Release Build)</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
            <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Core Engine</p>
            <p className="font-bold text-[#09090B] dark:text-white mt-0.5">Tauri v2 + Rust 2021</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
            <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Storage Mode</p>
            <p className="font-bold text-emerald-700 dark:text-emerald-400 mt-0.5 flex items-center gap-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>100% Offline Embedded SQLite</span>
            </p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]">
            <p className="text-[10px] text-[#71717A] dark:text-[#656467] uppercase">Telemetry</p>
            <p className="font-bold text-[#09090B] dark:text-white mt-0.5">Zero Cloud / Zero Tracking</p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white dark:bg-[#09090B] p-6 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-x-2 border-b border-[#E4E4E7] dark:border-[#27272A] pb-3">
          <Keyboard className="h-4 w-4 text-[#09090B] dark:text-white" />
          <h3 className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white tracking-wider">
            Quick Navigation & Shortcuts
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A]"
            >
              <span className="text-[#71717A] dark:text-[#656467]">{s.desc}</span>
              <kbd className="px-2 py-0.5 bg-white dark:bg-black border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white font-bold text-[10px]">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>

      {/* Changelog Overview */}
      <div className="bg-white dark:bg-[#09090B] p-6 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-x-2 border-b border-[#E4E4E7] dark:border-[#27272A] pb-3">
          <History className="h-4 w-4 text-[#09090B] dark:text-white" />
          <h3 className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white tracking-wider">
            Release Changelog
          </h3>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="border-l-2 border-black dark:border-white pl-3 space-y-1">
            <p className="font-bold text-[#09090B] dark:text-white">v1.0.0 — Initial Release</p>
            <ul className="text-[#71717A] dark:text-[#656467] text-[11px] space-y-0.5 list-disc list-inside">
              <li>100% offline local embedded SQLite database persistence.</li>
              <li>Pure monochrome Tech-Noir brutalist aesthetic with Dark/Light modes.</li>
              <li>Fluid drag-and-drop Kanban workspace with multi-attribute filtering.</li>
              <li>Complete offline snapshot database export and restore.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
