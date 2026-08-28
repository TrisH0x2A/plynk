import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import { useMobileSidebar } from "@/stores/use-mobile-sidebar";
import { Button } from "@/components/ui/button";

interface MobileSidebarProps {
  children?: React.ReactNode;
}

export const MobileSidebar = ({ children }: MobileSidebarProps) => {
  const isOpen = useMobileSidebar((state) => state.isOpen);
  const onOpen = useMobileSidebar((state) => state.onOpen);
  const onClose = useMobileSidebar((state) => state.onClose);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Button
        onClick={onOpen}
        className="block md:hidden mr-2"
        variant="ghost"
        size="sm"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative w-72 bg-white h-full p-6 shadow-xl z-10 overflow-y-auto">
            {children}
          </div>
        </div>
      )}
    </>
  );
};
