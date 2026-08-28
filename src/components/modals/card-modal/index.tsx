import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCardModal } from "@/stores/use-card-modal";
import { tauriApi } from "@/lib/tauri";
import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { StatusPicker } from "./status-picker";
import { LabelPicker } from "./label-picker";

interface CardModalProps {
  boardId: string;
}

export const CardModal = ({ boardId }: CardModalProps) => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);

  const { data: cardData } = useQuery({
    queryKey: ["card", id],
    queryFn: () => tauriApi.getCardById(id!),
    enabled: !!id,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#09090B] border border-[#27272A] text-white max-w-3xl rounded-none shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
        {!cardData ? (
          <div className="p-8 text-center font-mono text-xs text-[#656467] uppercase">
            Loading task details...
          </div>
        ) : (
          <>
            <Header data={cardData} boardId={boardId} />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
              <div className="col-span-3 space-y-6">
                <StatusPicker data={cardData} boardId={boardId} />
                <LabelPicker data={cardData} boardId={boardId} />
                <Description data={cardData} boardId={boardId} />
              </div>
              <Actions data={cardData} boardId={boardId} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
