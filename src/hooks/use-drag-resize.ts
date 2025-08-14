import { useState, useCallback, useEffect, useRef } from "react";

interface UseDragResizeOptions {
  minHeight: number;
  defaultHeight?: number;
  maxHeightRatio?: number;
}

interface UseDragResizeReturn {
  height: number;
  isDragging: boolean;
  isCollapsed: boolean;
  isMaximized: boolean;
  maxHeight: number;
  currentHeight: number;
  containerRef: React.RefObject<HTMLDivElement>;
  dragRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  toggleCollapse: () => void;
  toggleMaximize: () => void;
}

export const useDragResize = ({
  minHeight,
  defaultHeight = 300,
  maxHeightRatio = 0.8,
}: UseDragResizeOptions): UseDragResizeReturn => {
  const [height, setHeight] = useState(defaultHeight);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [maxHeight, setMaxHeight] = useState(
    window.innerHeight * maxHeightRatio
  );

  const dragRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update maxHeight on window resize
  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(window.innerHeight * maxHeightRatio);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [maxHeightRatio]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newHeight = containerRect.bottom - e.clientY;

      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
      }
    },
    [isDragging, minHeight, maxHeight]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "ns-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(!isCollapsed);
    if (isMaximized) setIsMaximized(false);
  }, [isCollapsed, isMaximized]);

  const toggleMaximize = useCallback(() => {
    setIsMaximized(!isMaximized);
    if (isCollapsed) setIsCollapsed(false);
  }, [isCollapsed, isMaximized]);

  const currentHeight = isCollapsed ? 40 : isMaximized ? maxHeight : height;

  return {
    height,
    isDragging,
    isCollapsed,
    isMaximized,
    maxHeight,
    currentHeight,
    containerRef,
    dragRef,
    handleMouseDown,
    toggleCollapse,
    toggleMaximize,
  };
};
