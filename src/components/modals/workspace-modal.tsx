import React, { useState } from "react";
import { toast } from "sonner";
import { Plus, X, Layers } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}

export const WorkspaceModal = ({
  isOpen,
  onClose,
  onConfirm,
}: WorkspaceModalProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    onConfirm(name.trim());
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#09090B] border border-[#27272A] text-white max-w-md rounded-none shadow-2xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A] mb-4">
          <div className="flex items-center gap-x-2">
            <Layers className="h-4 w-4 text-white" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
              Initialize New Workspace
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] uppercase font-semibold text-[#656467] tracking-wider block">
              Workspace Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.G., CLIENT PROJECTS, INFRA..."
              autoFocus
              className="bg-black border border-[#27272A] text-white font-sans text-xs px-3 py-2.5 rounded-none focus-visible:border-white focus-visible:ring-0 placeholder:text-[#656467]"
            />
          </div>

          <div className="flex items-center justify-end gap-x-2 pt-2 border-t border-[#18181B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#131315] border border-[#27272A] text-[#656467] hover:text-white font-mono text-xs uppercase transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white text-black font-mono text-xs uppercase font-bold hover:bg-[#353437] hover:text-white transition-colors"
            >
              Create Workspace
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
