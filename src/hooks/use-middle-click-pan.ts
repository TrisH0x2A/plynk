import { useEffect, useRef, useState, RefObject } from "react";

export function useMiddleClickPan<T extends HTMLElement>(containerRef: RefObject<T | null>) {
  const [isPanning, setIsPanning] = useState(false);
  const panState = useRef({
    isDown: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Middle mouse button is button 1
      if (e.button === 1) {
        e.preventDefault();
        e.stopPropagation();
        panState.current = {
          isDown: true,
          startX: e.clientX,
          startY: e.clientY,
          scrollLeft: el.scrollLeft,
          scrollTop: el.scrollTop,
        };
        setIsPanning(true);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!panState.current.isDown) return;
      e.preventDefault();

      const dx = e.clientX - panState.current.startX;
      const dy = e.clientY - panState.current.startY;

      el.scrollLeft = panState.current.scrollLeft - dx;
      el.scrollTop = panState.current.scrollTop - dy;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (panState.current.isDown && (e.button === 1 || e.buttons === 0)) {
        panState.current.isDown = false;
        setIsPanning(false);
      }
    };

    const handleAuxClick = (e: MouseEvent) => {
      if (e.button === 1) {
        e.preventDefault();
      }
    };

    el.addEventListener("mousedown", handleMouseDown);
    el.addEventListener("auxclick", handleAuxClick);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      el.removeEventListener("mousedown", handleMouseDown);
      el.removeEventListener("auxclick", handleAuxClick);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef]);

  return { isPanning };
}
