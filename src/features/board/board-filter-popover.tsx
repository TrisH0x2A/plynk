import React from "react";
import { Filter, X, Search, RotateCcw, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useBoardFilter } from "@/stores/use-board-filter";
import { CardStatus } from "@/types";
import { getLabelColor } from "./card-item";

const STATUS_OPTIONS: { label: string; value: CardStatus; color: string }[] = [
  { label: "ACTIVE", value: "ACTIVE", color: "text-[#09090B] dark:text-white" },
  { label: "IN PROGRESS", value: "IN_PROGRESS", color: "text-cyan-800 dark:text-cyan-400" },
  { label: "COMPLETED", value: "COMPLETED", color: "text-emerald-800 dark:text-emerald-400" },
  { label: "POSTPONED", value: "POSTPONED", color: "text-amber-800 dark:text-amber-400" },
];

const PRESET_LABELS = [
  "URGENT",
  "HIGH PRIORITY",
  "BACKEND",
  "FRONTEND",
  "SECURITY",
  "BUG",
  "FEATURE",
  "DEVOPS",
];

export const BoardFilterPopover = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOpen = () => setIsOpen((prev) => !prev);
    window.addEventListener("plynk:open-filter", handleOpen);
    return () => window.removeEventListener("plynk:open-filter", handleOpen);
  }, []);

  const {
    keyword,
    selectedStatuses,
    selectedLabels,
    setKeyword,
    toggleStatus,
    toggleLabel,
    clearFilters,
    getActiveFilterCount,
  } = useBoardFilter();

  const activeCount = getActiveFilterCount();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`h-9 px-3.5 bg-white dark:bg-[#131315] border ${
            activeCount > 0
              ? "border-black dark:border-white font-bold bg-zinc-50 dark:bg-zinc-900"
              : "border-[#E4E4E7] dark:border-[#27272A]"
          } font-mono text-xs uppercase text-[#09090B] dark:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] hover:border-black dark:hover:border-[#A1A1AA] transition-colors flex items-center gap-x-2 font-semibold rounded-none cursor-pointer`}
        >
          <Filter
            className={`h-3.5 w-3.5 ${
              activeCount > 0
                ? "text-black dark:text-white"
                : "text-[#71717A] dark:text-[#656467]"
            }`}
          />
          <span>Filter</span>
          {activeCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-black text-white dark:bg-white dark:text-black font-mono text-[9px] font-bold">
              {activeCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 bg-white dark:bg-[#09090B] border border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white rounded-none p-4 shadow-2xl z-[100] space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E4E4E7] dark:border-[#27272A]">
          <div className="flex items-center gap-x-2">
            <Filter className="h-3.5 w-3.5 text-zinc-500" />
            <span className="font-mono text-xs font-bold text-[#09090B] dark:text-white uppercase tracking-wider">
              Filter Cards
            </span>
            {activeCount > 0 && (
              <span className="text-[10px] font-mono text-zinc-500 font-normal">
                ({activeCount} active)
              </span>
            )}
          </div>
          <div className="flex items-center gap-x-1">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-[10px] font-mono uppercase text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-x-1 mr-2 cursor-pointer font-semibold"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Reset</span>
              </button>
            )}
            <PopoverClose asChild>
              <button
                type="button"
                className="text-[#71717A] dark:text-[#656467] hover:text-black dark:hover:text-white hover:bg-[#F4F4F5] dark:hover:bg-[#18181B] transition-colors p-1 rounded-none cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </PopoverClose>
          </div>
        </div>

        {/* Keyword Search */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase font-bold text-[#71717A] dark:text-[#656467] tracking-wider block">
            Search Keyword
          </label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="SEARCH CARDS BY TITLE..."
              className="h-8 pl-8 pr-7 text-xs font-mono bg-zinc-50 dark:bg-black border-[#E4E4E7] dark:border-[#27272A] text-[#09090B] dark:text-white rounded-none uppercase placeholder:text-zinc-400 focus-visible:border-black dark:focus-visible:border-white focus-visible:ring-0"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-2 top-2 text-zinc-400 hover:text-black dark:hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase font-bold text-[#71717A] dark:text-[#656467] tracking-wider block">
            Status
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const isSelected = selectedStatuses.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleStatus(opt.value)}
                  className={`px-2 py-1.5 border font-mono text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center justify-between rounded-none cursor-pointer ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : "bg-zinc-50 dark:bg-[#131315] border-[#E4E4E7] dark:border-[#27272A] hover:border-zinc-400 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <span className={isSelected ? "" : opt.color}>{opt.label}</span>
                  {isSelected && <Check className="h-3 w-3 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Label Filter */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase font-bold text-[#71717A] dark:text-[#656467] tracking-wider block">
            Labels
          </label>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {PRESET_LABELS.map((lbl) => {
              const isSelected = selectedLabels.includes(lbl);
              return (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => toggleLabel(lbl)}
                  className={`px-2 py-1 border font-mono text-[10px] uppercase tracking-wider font-semibold transition-all flex items-center gap-x-1 rounded-none cursor-pointer ${
                    isSelected
                      ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                      : `bg-zinc-50 dark:bg-[#131315] ${getLabelColor(lbl)} hover:border-zinc-400`
                  }`}
                >
                  <span>{lbl}</span>
                  {isSelected && <Check className="h-2.5 w-2.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
