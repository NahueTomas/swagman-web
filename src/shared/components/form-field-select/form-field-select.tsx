import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { FormFieldActionButton } from "../form-field-action-button";

import { cn } from "@/shared/utils/cn";
import { ChevronDownIcon } from "@/shared/components/icons";
import { FormFieldProps, Primitive } from "@/shared/types/form-field";

export type SelectSize = "normal" | "small";
type Option = Primitive;

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const FormFieldSelect = ({
  id,
  onChange,
  value,
  options = [],
  required = false,
  size = "normal",
  disabled = false,
  placeholder = "Select an option",
}: FormFieldProps & { size?: SelectSize; disabled?: boolean }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectedValue =
    typeof value === "string" || typeof value === "number"
      ? (value as Option)
      : undefined;

  // Measure trigger position when opening
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setPosition({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 140),
    });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  // Reposition on scroll/resize while open
  useEffect(() => {
    if (!open) return;

    const handleReposition = () => updatePosition();

    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);

    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open, updatePosition]);

  // Click-outside: check both trigger and portal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inTrigger = triggerRef.current?.contains(target);
      const inPortal = portalRef.current?.contains(target);

      if (!inTrigger && !inPortal) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const cleanOptions = (options || []).filter(
    (o): o is Option => typeof o === "string" || typeof o === "number"
  );

  const handleSelect = (opt: Option) => {
    onChange(opt);
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const sizeConfig = {
    normal: {
      button: "px-3 py-1.5 text-xs",
      icon: "size-3.5",
      dropdownItem: "px-3 py-1.5 text-xs",
    },
    small: {
      button: "px-2 py-1 text-[10px] h-6",
      icon: "size-3",
      dropdownItem: "px-2 py-1 text-[10px]",
    },
  };

  return (
    <div
      ref={triggerRef}
      className="relative w-full group/select text-foreground-200"
      id={id}
    >
      {/* Trigger / Combobox */}
      <div
        aria-controls={`${id}-listbox`}
        aria-disabled={disabled}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "relative flex items-center justify-between w-full rounded-md outline-none cursor-pointer",
          sizeConfig[size].button,

          // Base
          "bg-transparent border border-transparent font-mono",

          // Transitions
          "transition-[border-color,background-color,box-shadow] duration-200 ease-out",

          // Hover
          !open && "hover:border-white/[0.08] hover:bg-white/[0.03]",

          // Focus
          "focus-visible:border-primary-500/40 focus-visible:bg-white/[0.03]",
          "focus-visible:shadow-[0_0_0_3px_rgba(190,151,110,0.06)]",

          // Open — active state with accent
          open && [
            "border-primary-500/40 bg-white/[0.03]",
            "shadow-[0_0_0_3px_rgba(190,151,110,0.06),inset_0_1px_0_rgba(190,151,110,0.04)]",
          ],

          // Disabled
          disabled &&
            "opacity-40 cursor-not-allowed hover:border-transparent hover:bg-transparent"
        )}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(!open);
          }
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <span
          className={cn(
            "truncate text-left flex-1 transition-colors duration-150",
            !selectedValue && "text-foreground-600 italic font-sans"
          )}
        >
          {selectedValue !== undefined ? String(selectedValue) : placeholder}
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          {/* Clear Selection Button */}
          {!required && selectedValue !== undefined && !disabled && (
            <FormFieldActionButton
              action="delete"
              aria-label="Clear selection"
              onClick={handleClear}
            />
          )}

          {/* Arrow Indicator */}
          <ChevronDownIcon
            className={cn(
              "transition-[transform,color] duration-200 ease-out",
              sizeConfig[size].icon,
              open
                ? "rotate-180 text-primary-500"
                : "text-foreground-600 group-hover/select:text-foreground-400"
            )}
          />
        </div>

        {/* Focus underline — slides in from center */}
        <div
          className={cn(
            "absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gradient-to-r from-transparent via-primary-500 to-transparent transition-[width] duration-300 ease-out opacity-60",
            open && "w-4/5"
          )}
        />
      </div>

      {/* Dropdown Menu — portaled to document.body to escape overflow containers */}
      {createPortal(
        <div
          ref={portalRef}
          className={cn(
            "fixed z-[200] overflow-hidden rounded-md border border-white/[0.08] shadow-2xl shadow-black/50 transition-opacity duration-150",
            open
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          )}
          id={`${id}-listbox`}
          role="listbox"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
          }}
        >
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 bg-background-500 backdrop-blur-xl">
            {cleanOptions.length > 0 ? (
              cleanOptions.map((opt) => (
                <button
                  key={String(opt)}
                  aria-selected={selectedValue === opt}
                  className={cn(
                    "w-full text-left font-mono rounded-md",
                    "transition-[background-color,color] duration-150 ease-out",
                    sizeConfig[size].dropdownItem,
                    selectedValue === opt
                      ? "bg-primary-500/15 text-primary-400 font-semibold"
                      : "text-foreground-400 hover:text-foreground-100 hover:bg-white/[0.06]"
                  )}
                  role="option"
                  type="button"
                  onClick={() => handleSelect(opt)}
                >
                  {String(opt)}
                </button>
              ))
            ) : (
              <div
                className={cn(
                  "text-foreground-600 italic text-center py-2",
                  sizeConfig[size].dropdownItem
                )}
              >
                No options available
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
