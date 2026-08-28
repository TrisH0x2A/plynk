import { useEffect, useRef } from "react";

interface AutoScrollOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  isDragging: boolean;
  edgeThreshold?: number;
  maxSpeed?: number;
}

export function useBoardAutoScroll({
  containerRef,
  isDragging,
  edgeThreshold = 140,
  maxSpeed = 26,
}: AutoScrollOptions) {
  const mousePos = useRef<{ x: number; y: number } | null>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!isDragging) {
      mousePos.current = null;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      const el = containerRef.current;
      if (!el) return;
      if (e.deltaY !== 0) {
        el.scrollLeft += e.deltaY * 1.5;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    const scrollLoop = () => {
      const el = containerRef.current;
      const pos = mousePos.current;

      if (el && pos) {
        const rect = el.getBoundingClientRect();
        let vx = 0;
        let vy = 0;

        // Right edge
        if (pos.x > rect.right - edgeThreshold) {
          const distanceIntoEdge = pos.x - (rect.right - edgeThreshold);
          const ratio = Math.min(1, Math.max(0.1, distanceIntoEdge / edgeThreshold));
          vx = ratio * maxSpeed;
        }
        // Left edge
        else if (pos.x < rect.left + edgeThreshold) {
          const distanceIntoEdge = (rect.left + edgeThreshold) - pos.x;
          const ratio = Math.min(1, Math.max(0.1, distanceIntoEdge / edgeThreshold));
          vx = -ratio * maxSpeed;
        }

        // Bottom edge
        if (pos.y > rect.bottom - edgeThreshold) {
          const distanceIntoEdge = pos.y - (rect.bottom - edgeThreshold);
          const ratio = Math.min(1, Math.max(0.1, distanceIntoEdge / edgeThreshold));
          vy = ratio * maxSpeed;
        }
        // Top edge
        else if (pos.y < rect.top + edgeThreshold) {
          const distanceIntoEdge = (rect.top + edgeThreshold) - pos.y;
          const ratio = Math.min(1, Math.max(0.1, distanceIntoEdge / edgeThreshold));
          vy = -ratio * maxSpeed;
        }

        if (vx !== 0 || vy !== 0) {
          el.scrollLeft += vx;
          el.scrollTop += vy;
        }
      }

      animFrameId.current = requestAnimationFrame(scrollLoop);
    };

    animFrameId.current = requestAnimationFrame(scrollLoop);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
    };
  }, [isDragging, containerRef, edgeThreshold, maxSpeed]);
}
