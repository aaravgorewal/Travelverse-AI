import React, { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  width?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = "right",
  className,
  width = "w-60",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const alignStyles = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 origin-top-right rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-200 dark:border-slate-800 focus:outline-none animate-in fade-in zoom-in-95",
            alignStyles[align],
            width,
            className
          )}
        >
          <div onClick={() => setIsOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  badge?: string;
  aiAction?: boolean;
  destructive?: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  className,
  icon,
  badge,
  aiAction = false,
  destructive = false,
  children,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        "w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition-all text-left cursor-pointer",
        destructive
          ? "text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
          : aiAction
          ? "text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-bold"
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 truncate">
        {aiAction && <span className="text-purple-500 font-bold">✦</span>}
        {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </div>
      {badge && (
        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
          {badge}
        </span>
      )}
    </button>
  );
};

export const DropdownHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
    <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">{title}</p>
    {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

export const DropdownDivider: React.FC = () => (
  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
);
