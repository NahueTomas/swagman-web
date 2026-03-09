import React, { useState, useRef, useEffect } from "react";

import { cn } from "@/shared/utils/cn";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  onOpen?: () => void;
}

export const Dropdown = ({
  trigger,
  children,
  className,
  align = "left",
  onOpen,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const nextState = !isOpen;

    setIsOpen(nextState);
    if (nextState && onOpen) onOpen();
  };

  // Keyboard handler for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      <div
        className="cursor-pointer outline-none"
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={handleKeyDown}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute top-full mt-1 z-[110] min-w-[240px]",
            "bg-background-600 border border-white/15 rounded-md shadow-2xl shadow-black/50",
            "animate-in fade-in zoom-in-95 duration-100",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="p-2">{children}</div>
        </div>
      )}
    </div>
  );
};
