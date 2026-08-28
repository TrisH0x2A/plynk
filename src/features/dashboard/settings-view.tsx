import React, { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Trash2, AlertTriangle, Layers } from "lucide-react";
import { Workspace } from "@/types";
import { Input } from "@/components/ui/input";

interface SettingsViewProps {
  workspace: Workspace;
  canDelete?: boolean;
  onDeleteWorkspace?: (id: string, name: string) => void;
}

export const SettingsView = ({
  workspace,
  canDelete = true,
  onDeleteWorkspace,
}: SettingsViewProps) => {
  const [name] = useState(workspace.name);

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none">
      <div>
        <h2 className="font-sans text-3xl font-bold text-[#09090B] dark:text-white tracking-tighter mb-1">
          Workspace Settings
        </h2>
        <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
          Configuration // {workspace.name}
        </p>
      </div>

      <div className="bg-white dark:bg-[#09090B] p-6 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-6">
        <div className="space-y-2">
          <label className="font-mono text-xs font-semibold text-[#09090B] dark:text-white uppercase tracking-wider">
            Workspace Name
          </label>
          <Input
            value={name}
            readOnly
            disabled
            className="bg-zinc-50 dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] text-zinc-900 dark:text-white font-sans text-sm rounded-none"
          />
        </div>

        <div className="space-y-2">
          <label className="font-mono text-xs font-semibold text-[#09090B] dark:text-white uppercase tracking-wider">
            Workspace Identifier / Slug
          </label>
          <Input
            value={workspace.slug}
            readOnly
            disabled
            className="bg-zinc-50 dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] text-zinc-900 dark:text-white font-mono text-xs rounded-none"
          />
        </div>

        <div className="pt-4 border-t border-[#E4E4E7] dark:border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-x-2 text-xs font-mono text-[#71717A] dark:text-[#656467] uppercase">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Local Encrypted Storage</span>
          </div>

          <button
            type="button"
            onClick={() => toast.info("Workspace settings are managed locally")}
            className="bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase px-5 py-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold cursor-pointer rounded-none"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Danger Zone: Delete Workspace */}
      <div className="bg-rose-50/50 dark:bg-[#09090B] p-6 border border-rose-200 dark:border-rose-900/30 shadow-sm dark:shadow-none space-y-4">
        <div className="flex items-center gap-x-2 text-rose-700 dark:text-rose-400">
          <AlertTriangle className="h-4 w-4" />
          <h3 className="font-mono text-xs uppercase font-bold tracking-wider">
            Danger Zone // Delete Workspace
          </h3>
        </div>

        <p className="font-sans text-xs text-zinc-600 dark:text-[#c4c7c8]">
          Permanently delete workspace <strong className="text-zinc-900 dark:text-white uppercase font-mono">{workspace.name}</strong> and all associated boards, lists, cards, and activity logs.
        </p>

        <button
          type="button"
          onClick={() => onDeleteWorkspace?.(workspace.id, workspace.name)}
          className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-950/40 dark:border dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white font-mono text-xs uppercase px-4 py-2 transition-colors font-bold flex items-center gap-x-2 cursor-pointer rounded-none shadow-sm"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Workspace</span>
        </button>
      </div>
    </div>
  );
};
