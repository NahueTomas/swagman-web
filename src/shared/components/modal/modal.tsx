import { ReactNode, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/shared/utils/cn";
import { XIcon } from "@/shared/components/icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  className,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();

        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener("keydown", handleKeyDown);

    // Focus the modal on open
    requestAnimationFrame(() => {
      modalRef.current?.focus();
    });

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-background-950/90 backdrop-blur-md animate-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        aria-label={typeof title === "string" ? title : undefined}
        aria-modal="true"
        className={cn(
          "relative w-full max-w-xl",
          "bg-gradient-to-b from-background-600 to-background-700 rounded-xl",
          "border border-white/[0.05] ring-1 ring-inset ring-white/[0.04]",
          "shadow-2xl shadow-black/70",
          "flex flex-col max-h-[85vh]",
          "animate-modal-panel",
          "outline-none",
          className
        )}
        role="dialog"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] bg-background-600/40 rounded-t-xl">
          <div className="flex items-center gap-3">
            {icon && (
              <span className="flex items-center justify-center size-8 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0">
                {icon}
              </span>
            )}
            <div>
              <h2 className="text-sm font-semibold text-foreground-100">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-foreground-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            aria-label="Close"
            className="p-2 -mr-1 rounded-lg text-foreground-600 hover:text-foreground-200 hover:bg-white/[0.05] transition-colors"
            type="button"
            onClick={onClose}
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-white/[0.05] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
