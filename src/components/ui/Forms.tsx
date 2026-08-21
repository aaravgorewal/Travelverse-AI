import React, { forwardRef, useState } from "react";
import { Eye, EyeOff, Search, X, Check } from "lucide-react";
import { cn } from "../../lib/utils";

// ======================== INPUT ========================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  aiSuggested?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, iconLeft, iconRight, aiSuggested, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={inputId}
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
            {aiSuggested && (
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                ✦ AI Autofilled
              </span>
            )}
          </div>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none flex items-center justify-center">
              {iconLeft}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-150 placeholder:text-slate-400 shadow-xs",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              aiSuggested && "border-purple-300 dark:border-purple-800 bg-purple-50/20 dark:bg-purple-950/10",
              error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 flex items-center justify-center">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// ======================== SEARCH INPUT ========================
export interface SearchInputProps extends Omit<InputProps, "iconLeft"> {
  onClear?: () => void;
  shortcut?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, shortcut = "⌘K", placeholder = "Search flights, hotels, cities...", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={ref}
          value={value}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-16 py-2.5 text-sm text-slate-900 transition-all",
            "focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs",
            "dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:focus:bg-slate-900",
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {value && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {shortcut && (
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {shortcut}
            </kbd>
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// ======================== PASSWORD INPUT ========================
export const PasswordInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      ref={ref}
      type={showPassword ? "text" : "password"}
      iconRight={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

// ======================== TEXTAREA ========================
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  aiSuggested?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, aiSuggested, id, rows = 3, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
            >
              {label}
            </label>
            {aiSuggested && (
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                ✦ AI Enhanced
              </span>
            )}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 shadow-xs",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// ======================== SELECT ========================
export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-all shadow-xs cursor-pointer",
            "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            "dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-900">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// ======================== CHECKBOX ========================
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, checked, id, ...props }, ref) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <label htmlFor={checkboxId} className="flex items-start gap-3 cursor-pointer select-none group">
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="h-5 w-5 rounded-lg border-2 border-slate-300 bg-white transition-all peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500/30 dark:border-slate-700 dark:bg-slate-900 dark:peer-checked:bg-blue-600 group-hover:border-slate-400" />
          <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
        </div>
        {(label || description) && (
          <div className="text-left space-y-0.5">
            {label && (
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// ======================== SWITCH / TOGGLE ========================
export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  aiBadge?: boolean;
  size?: "sm" | "md";
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  aiBadge = false,
  size = "md",
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between gap-4 cursor-pointer select-none",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {(label || description) && (
        <div className="space-y-0.5 text-left">
          <div className="flex items-center gap-1.5">
            {label && (
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {label}
              </span>
            )}
            {aiBadge && (
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                ✦ AI Auto
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cn(
          "relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/30",
          size === "sm" ? "h-5 w-9" : "h-6 w-11",
          checked
            ? aiBadge
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-blue-600"
            : "bg-slate-300 dark:bg-slate-700"
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
            size === "sm" ? "h-4 w-4" : "h-5 w-5",
            checked
              ? size === "sm"
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
};

// ======================== RANGE SLIDER ========================
export interface RangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (val: number) => void;
  label?: string;
  formatValue?: (val: number) => string;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  label,
  formatValue = (v) => `${v}`,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full space-y-2 text-left">
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            {label}
          </span>
        )}
        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 font-mono">
          {formatValue(value)}
        </span>
      </div>
      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
        />
      </div>
      <div className="flex justify-between text-[10px] font-semibold text-slate-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};
