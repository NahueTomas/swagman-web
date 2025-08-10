import { ReactNode, useRef, useState, useEffect, useCallback } from "react";

type ResizableProps = {
  children: ReactNode;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  axis: "x" | "y" | "all";
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
};

export const Resizable = ({
  children,
  minWidth = 100,
  maxWidth = Infinity,
  minHeight = 100,
  maxHeight = Infinity,
  axis = "all",
  defaultWidth = 300,
  defaultHeight = 200,
  className = "",
}: ResizableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resizing, setResizing] = useState(false);
  const [size, setSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  // Use refs to avoid re-renders during resize
  const resizeRef = useRef<{
    startPos: { x: number; y: number };
    currentSize: { width: number; height: number };
    rafId?: number;
  }>({
    startPos: { x: 0, y: 0 },
    currentSize: { width: defaultWidth, height: defaultHeight },
  });

  // Optimized mouse move handler with requestAnimationFrame
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing || !containerRef.current) return;

      // Cancel previous animation frame
      if (resizeRef.current.rafId) {
        cancelAnimationFrame(resizeRef.current.rafId);
      }

      // Schedule update for next frame
      resizeRef.current.rafId = requestAnimationFrame(() => {
        const deltaX = e.clientX - resizeRef.current.startPos.x;
        const deltaY = e.clientY - resizeRef.current.startPos.y;

        const newSize = { ...resizeRef.current.currentSize };

        if (axis === "x" || axis === "all") {
          newSize.width = Math.max(
            Math.min(resizeRef.current.currentSize.width + deltaX, maxWidth),
            minWidth
          );
        }

        if (axis === "y" || axis === "all") {
          newSize.height = Math.max(
            Math.min(resizeRef.current.currentSize.height + deltaY, maxHeight),
            minHeight
          );
        }

        // Update container style directly for smooth animation
        if (containerRef.current) {
          if (axis === "x" || axis === "all") {
            containerRef.current.style.width = `${newSize.width}px`;
          }
          if (axis === "y" || axis === "all") {
            containerRef.current.style.height = `${newSize.height}px`;
          }
        }

        // Update refs
        resizeRef.current.startPos = { x: e.clientX, y: e.clientY };
        resizeRef.current.currentSize = newSize;
      });
    },
    [resizing, axis, minWidth, maxWidth, minHeight, maxHeight]
  );

  const handleMouseUp = useCallback(() => {
    if (resizeRef.current.rafId) {
      cancelAnimationFrame(resizeRef.current.rafId);
    }

    // Update state with final size
    setSize(resizeRef.current.currentSize);
    setResizing(false);

    // Remove cursor styles
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      setResizing(true);

      // Initialize refs
      resizeRef.current.startPos = { x: e.clientX, y: e.clientY };
      resizeRef.current.currentSize = { ...size };

      // Set cursor styles
      document.body.style.cursor = {
        x: "ew-resize",
        y: "ns-resize",
        all: "nwse-resize",
      }[axis];
      document.body.style.userSelect = "none";
    },
    [size, axis]
  );

  // Mouse event listeners
  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (resizeRef.current.rafId) {
        cancelAnimationFrame(resizeRef.current.rafId);
      }
    };
  }, [resizing, handleMouseMove, handleMouseUp]);

  const cursorType = {
    x: "ew-resize",
    y: "ns-resize",
    all: "nwse-resize",
  }[axis];

  return (
    <div
      ref={containerRef}
      className="relative"
      style={{
        width: axis === "x" || axis === "all" ? `${size.width}px` : "auto",
        height: axis === "y" || axis === "all" ? `${size.height}px` : "auto",
      }}
    >
      {children}

      <div
        aria-label="Resize"
        className="absolute bottom-0 right-0 p-2 cursor-pointer transition-all duration-200 ease-out"
        role="button"
        style={{
          cursor: cursorType,
          touchAction: "none",
          width: axis === "y" ? "100%" : 16,
          height: axis === "x" ? "100%" : 16,
          bottom: 0,
          right: 0,
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            // Simulate mouse down for keyboard users
            const rect = containerRef.current?.getBoundingClientRect();

            if (rect) {
              handleMouseDown({
                preventDefault: () => {},
                clientX: rect.right,
                clientY: rect.bottom,
              } as React.MouseEvent<HTMLDivElement>);
            }
          }
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
