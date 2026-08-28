import React, { useState } from "react";
import { toast } from "sonner";
import { Database, Download, Upload, HardDrive } from "lucide-react";
import { save, open } from "@tauri-apps/plugin-dialog";
import { tauriApi } from "@/lib/tauri";

export const BackupView = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const onExport = async () => {
    try {
      setIsExporting(true);
      const filePath = await save({
        title: "Export Database Backup",
        defaultPath: "plynk-backup.db",
        filters: [{ name: "SQLite Database", extensions: ["db", "sqlite"] }],
      });

      if (filePath) {
        await tauriApi.exportDatabase(filePath);
        toast.success("Database backup saved successfully!");
      }
    } catch (error) {
      toast.error(`Export failed: ${String(error)}`);
    } finally {
      setIsExporting(false);
    }
  };

  const onRestore = async () => {
    try {
      setIsRestoring(true);
      const selected = await open({
        title: "Restore Database Backup",
        multiple: false,
        filters: [{ name: "SQLite Database", extensions: ["db", "sqlite"] }],
      });

      if (selected && typeof selected === "string") {
        await tauriApi.restoreDatabase(selected);
        toast.success("Database restored! Restarting application...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast.error(`Restore failed: ${String(error)}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none">
      <div>
        <h2 className="font-sans text-4xl font-bold text-[#09090B] dark:text-white tracking-tighter mb-2">
          Local Data Backup & Restore
        </h2>
        <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider">
          Storage // SQLite Database File
        </p>
      </div>

      <div className="bg-white dark:bg-[#09090B] p-8 border border-[#E4E4E7] dark:border-[#27272A] shadow-sm dark:shadow-none space-y-8">
        <div>
          <div className="flex items-center gap-x-2 text-[#09090B] dark:text-white mb-2">
            <HardDrive className="h-5 w-5 text-[#09090B] dark:text-white" />
            <h3 className="font-sans font-bold text-lg">Export Complete Backup</h3>
          </div>
          <p className="font-sans text-sm text-zinc-600 dark:text-[#c4c7c8] mb-4 leading-relaxed">
            Export a complete binary snapshot of your local SQLite database file (`plynk.db`) to any directory on your computer.
          </p>
          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase px-5 py-2.5 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-semibold flex items-center gap-x-2 rounded-none cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? "EXPORTING..." : "EXPORT DATABASE"}</span>
          </button>
        </div>

        <hr className="border-[#E4E4E7] dark:border-[#27272A]" />

        <div>
          <div className="flex items-center gap-x-2 text-[#09090B] dark:text-white mb-2">
            <Database className="h-5 w-5 text-[#09090B] dark:text-white" />
            <h3 className="font-sans font-bold text-lg">Restore Database Backup</h3>
          </div>
          <p className="font-sans text-sm text-zinc-600 dark:text-[#c4c7c8] mb-4 leading-relaxed">
            Overwrite your current workspace with a previously exported `plynk.db` backup file.
          </p>
          <button
            type="button"
            onClick={onRestore}
            disabled={isRestoring}
            className="bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-zinc-900 dark:text-white font-mono text-xs uppercase px-5 py-2.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-semibold flex items-center gap-x-2 rounded-none cursor-pointer"
          >
            <Upload className="h-4 w-4" />
            <span>{isRestoring ? "RESTORING..." : "RESTORE DATABASE"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
