import { ReactNode, useRef, useState, useEffect } from "react";

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
  const [size, setSize] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });
  const [resizing, setResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResizing(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizing) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      setSize((prev) => {
        const newSize = { ...prev };

        if (axis === "x" || axis === "all") {
          newSize.width = Math.max(
            Math.min(prev.width + deltaX, maxWidth),
            minWidth
          );
        }

        if (axis === "y" || axis === "all") {
          newSize.height = Math.max(
            Math.min(prev.height + deltaY, maxHeight),
            minHeight
          );
        }

        return newSize;
      });

      setStartPos({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleMouseUp = () => {
      setResizing(false);
    };

    if (resizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, startPos, minWidth, maxWidth, minHeight, maxHeight, axis]);

  const cursorType = {
    x: "ew-resize",
    y: "ns-resize",
    all: "nwse-resize",
  }[axis];

  return (
    <div
      ref={containerRef}
      className={`relative ${className} ${resizing ? "border-r border-r-primary" : ""}`}
      style={{
        width: axis === "x" || axis === "all" ? `${size.width}px` : "auto",
        height: axis === "y" || axis === "all" ? `${size.height}px` : "auto",
      }}
    >
      {children}

      <div
        aria-label="Resize"
        className="absolute bottom-0 right-0 p-2 cursor-pointer transition-colors duration-250 border-r border-r-transparent hover:border-r-primary"
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
            setResizing(true);
          }
        }}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
