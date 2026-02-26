/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { ReactNode } from "react";
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
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-950/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={cn(
          "relative w-full max-w-xl",
          "bg-background-700 rounded-md",
          "border border-divider",
          "shadow-2xl shadow-black/50",
          "flex flex-col max-h-[85vh]",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <div className="flex items-center gap-3">
            {icon && <span className="text-primary-500">{icon}</span>}
            <div>
              <h2 className="text-base font-semibold text-foreground-100">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-foreground-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            className="p-1.5 -mr-1.5 rounded-md text-foreground-500 hover:text-foreground-200 hover:bg-background-500 transition-colors"
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
          <div className="px-5 py-4 border-t border-divider flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
