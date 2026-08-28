import { useEffect, useState } from "react";
import { CardModal } from "@/components/modals/card-modal";

interface ModalProviderProps {
  activeBoardId: string;
}

export const ModalProvider = ({ activeBoardId }: ModalProviderProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {activeBoardId && <CardModal boardId={activeBoardId} />}
    </>
  );
};
