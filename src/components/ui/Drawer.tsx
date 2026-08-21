import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  position?: "right" | "left" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  aiThemed?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  description,
  position = "right",
  size = "md",
  aiThemed = false,
  children,
  footer,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClassesRight = {
    sm: "max-w-sm",
    md: "max-w-md sm:max-w-lg",
    lg: "max-w-xl sm:max-w-2xl",
    xl: "max-w-3xl sm:max-w-4xl",
    full: "max-w-full",
  };

  const positionClasses = {
    right: "inset-y-0 right-0 h-full animate-in slide-in-from-right duration-300",
    left: "inset-y-0 left-0 h-full animate-in slide-in-from-left duration-300",
    bottom: "inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl animate-in slide-in-from-bottom duration-300",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-0 pointer-events-none flex">
        <div
          className={cn(
            "pointer-events-auto relative flex w-full flex-col bg-white shadow-2xl dark:bg-slate-900 border-slate-200 dark:border-slate-800",
            position === "right" && "ml-auto border-l",
            position === "left" && "mr-auto border-r",
            position === "bottom" && "mt-auto border-t",
            position !== "bottom" && sizeClassesRight[size],
            positionClasses[position],
            aiThemed && "border-purple-500/30"
          )}
        >
          {position === "bottom" && (
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>
          )}

          {aiThemed && (
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />
          )}

          {/* Drawer Header */}
          {(title || description) && (
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4.5">
              <div>
                {aiThemed && (
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                    ✦ AI Assistant Suite
                  </span>
                )}
                {title && (
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6">{children}</div>

          {/* Drawer Footer */}
          {footer && (
            <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
