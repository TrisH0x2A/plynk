import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Folder,
  Layout,
  FileText,
  Clock,
  User,
  Layers,
  Sparkles,
  Search,
} from "lucide-react";
import { tauriApi } from "@/lib/tauri";
import { RecycleBinItem } from "@/types";

interface RecycleBinViewProps {
  onRefreshWorkspaces?: () => void;
}

export const RecycleBinView = ({ onRefreshWorkspaces }: RecycleBinViewProps) => {
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items = [], isLoading } = useQuery<RecycleBinItem[]>({
    queryKey: ["recycle-bin"],
    queryFn: () => tauriApi.getRecycleBin(),
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => tauriApi.restoreBinItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board-lists"] });
      onRefreshWorkspaces?.();
      toast.success("Item restored successfully");
    },
    onError: (err) => toast.error(String(err)),
  });

  const restoreAllMutation = useMutation({
    mutationFn: () => tauriApi.restoreAllBinItems(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board-lists"] });
      onRefreshWorkspaces?.();
      toast.success("All items restored");
    },
    onError: (err) => toast.error(String(err)),
  });

  const deletePermanentMutation = useMutation({
    mutationFn: (id: string) => tauriApi.deleteBinItemPermanently(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Permanently deleted from bin");
    },
    onError: (err) => toast.error(String(err)),
  });

  const clearAllMutation = useMutation({
    mutationFn: () => tauriApi.clearRecycleBin(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recycle-bin"] });
      toast.success("Recycle bin emptied");
    },
    onError: (err) => toast.error(String(err)),
  });

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === "ALL" || item.item_type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const workspaceCount = items.filter((i) => i.item_type === "WORKSPACE").length;
  const boardCount = items.filter((i) => i.item_type === "BOARD").length;
  const cardCount = items.filter((i) => i.item_type === "CARD").length;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const parseMeta = (metaStr: string) => {
    try {
      return JSON.parse(metaStr);
    } catch {
      return {};
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 select-none pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E4E7] dark:border-[#27272A] pb-5">
        <div>
          <div className="flex items-center gap-x-2.5">
            <Trash2 className="h-6 w-6 text-[#09090B] dark:text-white" />
            <h2 className="font-sans text-3xl font-bold text-[#09090B] dark:text-white tracking-tighter">
              Recycle Bin
            </h2>
          </div>
          <p className="font-mono text-xs text-[#71717A] dark:text-[#656467] uppercase tracking-wider mt-1">
            System Recovery & Archival // {items.length} {items.length === 1 ? "Item" : "Items"} Deleted
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-x-2">
            <button
              type="button"
              onClick={() => restoreAllMutation.mutate()}
              disabled={restoreAllMutation.isPending}
              className="h-9 px-4 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors flex items-center gap-x-1.5 cursor-pointer rounded-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore All</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Are you sure you want to empty the Recycle Bin permanently?")) {
                  clearAllMutation.mutate();
                }
              }}
              disabled={clearAllMutation.isPending}
              className="h-9 px-4 bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs uppercase font-bold transition-colors flex items-center gap-x-1.5 cursor-pointer rounded-none"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty Bin</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Type Tabs */}
        <div className="flex items-center border border-[#E4E4E7] dark:border-[#27272A] p-0.5 bg-zinc-50 dark:bg-[#131315] w-full sm:w-auto">
          {[
            { id: "ALL", label: "ALL", count: items.length },
            { id: "WORKSPACE", label: "WORKSPACES", count: workspaceCount },
            { id: "BOARD", label: "BOARDS", count: boardCount },
            { id: "CARD", label: "CARDS", count: cardCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 font-mono text-xs uppercase transition-colors flex items-center gap-x-1.5 cursor-pointer ${
                filterType === tab.id
                  ? "bg-black dark:bg-white text-white dark:text-black font-bold"
                  : "text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#71717A] dark:text-[#656467]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER DELETED ITEMS..."
            className="w-full h-9 pl-8 pr-3 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] text-xs font-mono uppercase text-[#09090B] dark:text-white placeholder:text-[#71717A] dark:placeholder:text-[#656467] rounded-none focus:outline-none focus:border-black dark:focus:border-white"
          />
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="p-12 text-center font-mono text-xs uppercase text-[#71717A] dark:text-[#656467]">
          Scanning Recycle Bin...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 border border-dashed border-[#E4E4E7] dark:border-[#27272A] text-center space-y-3 bg-zinc-50/50 dark:bg-[#09090B]/50">
          <Trash2 className="h-10 w-10 mx-auto text-zinc-300 dark:text-zinc-700" />
          <p className="font-mono text-xs uppercase font-bold text-[#09090B] dark:text-white">
            {items.length === 0 ? "Recycle Bin is Empty" : "No Matching Items Found"}
          </p>
          <p className="font-sans text-xs text-[#71717A] dark:text-[#656467] max-w-sm mx-auto">
            {items.length === 0
              ? "Deleted workspaces, boards, and cards will be preserved here and can be restored at any time."
              : "Try switching filter categories or clearing the search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const meta = parseMeta(item.meta);

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] p-4 sm:p-5 hover:border-black dark:hover:border-[#52525B] transition-colors space-y-3 shadow-sm dark:shadow-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-x-2">
                      {/* Type Badge */}
                      <span
                        className={`px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider border ${
                          item.item_type === "WORKSPACE"
                            ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
                            : item.item_type === "BOARD"
                            ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                        }`}
                      >
                        {item.item_type}
                      </span>

                      {/* Title */}
                      <h4 className="font-mono text-sm font-bold text-[#09090B] dark:text-white uppercase tracking-tight">
                        {item.title}
                      </h4>
                    </div>

                    {/* Metadata summary */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-[#71717A] dark:text-[#656467]">
                      <span className="flex items-center gap-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Deleted {formatDate(item.deleted_at)}</span>
                      </span>
                      <span className="flex items-center gap-x-1">
                        <User className="h-3 w-3" />
                        <span className="uppercase">{item.actor}</span>
                      </span>

                      {/* Workspace breakdown stats */}
                      {item.item_type === "WORKSPACE" && (
                        <span className="flex items-center gap-x-1 text-purple-600 dark:text-purple-400 font-semibold">
                          <Layers className="h-3 w-3" />
                          <span>
                            {meta.board_count || 0} Boards • {meta.card_count || 0} Total Cards
                          </span>
                        </span>
                      )}

                      {/* Board breakdown stats */}
                      {item.item_type === "BOARD" && (
                        <span className="flex items-center gap-x-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <Layout className="h-3 w-3" />
                          <span>
                            {meta.card_count || 0} Cards • {meta.list_count || 0} Lists
                          </span>
                        </span>
                      )}

                      {/* Card origin */}
                      {item.item_type === "CARD" && meta.list_title && (
                        <span className="flex items-center gap-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <FileText className="h-3 w-3" />
                          <span>Origin: {meta.list_title}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-x-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => restoreMutation.mutate(item.id)}
                      disabled={restoreMutation.isPending}
                      className="h-8 px-3 bg-zinc-100 dark:bg-[#18181B] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-[#E4E4E7] dark:border-[#27272A] font-mono text-xs uppercase font-semibold transition-colors flex items-center gap-x-1.5 cursor-pointer rounded-none"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Permanently delete "${item.title}"? This cannot be undone.`)) {
                          deletePermanentMutation.mutate(item.id);
                        }
                      }}
                      disabled={deletePermanentMutation.isPending}
                      className="h-8 px-3 bg-transparent hover:bg-rose-600 hover:text-white text-[#71717A] dark:text-[#656467] border border-[#E4E4E7] dark:border-[#27272A] hover:border-rose-600 font-mono text-xs uppercase font-semibold transition-colors flex items-center gap-x-1.5 cursor-pointer rounded-none"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete Forever</span>
                    </button>
                  </div>
                </div>

                {/* Workspace Child Boards Pills */}
                {item.item_type === "WORKSPACE" && meta.boards && meta.boards.length > 0 && (
                  <div className="pt-2 border-t border-[#E4E4E7] dark:border-[#27272A] flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-[#71717A] dark:text-[#656467]">
                      Contained Boards:
                    </span>
                    {meta.boards.map((b: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-zinc-50 dark:bg-[#131315] border border-[#E4E4E7] dark:border-[#27272A] font-mono text-[10px] uppercase text-[#09090B] dark:text-white flex items-center gap-x-1"
                      >
                        <span className="font-semibold">{b.title}</span>
                        <span className="text-[#71717A] dark:text-[#656467]">({b.card_count} cards)</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
