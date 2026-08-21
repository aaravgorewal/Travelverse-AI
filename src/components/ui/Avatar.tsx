import React, { useState } from "react";
import { cn } from "../../lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  status?: "online" | "in-flight" | "busy" | "offline";
  variant?: "default" | "luxury" | "ai";
}

export const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt = "Avatar",
  name,
  size = "md",
  status,
  variant = "default",
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg font-bold",
    "2xl": "h-20 w-20 text-xl font-bold",
  };

  const statusDotSizes = {
    xs: "h-1.5 w-1.5 bottom-0 right-0",
    sm: "h-2 w-2 bottom-0 right-0",
    md: "h-2.5 w-2.5 bottom-0 right-0",
    lg: "h-3 w-3 bottom-0.5 right-0.5",
    xl: "h-3.5 w-3.5 bottom-1 right-1",
    "2xl": "h-4 w-4 bottom-1 right-1",
  };

  const statusColors = {
    online: "bg-emerald-500",
    "in-flight": "bg-blue-500 animate-pulse",
    busy: "bg-rose-500",
    offline: "bg-slate-400",
  };

  const getInitials = (n?: string) => {
    if (!n) return "?";
    return n
      .split(" ")
      .map((part) => part.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl overflow-hidden font-bold select-none transition-transform",
          sizeClasses[size],
          variant === "default" && "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
          variant === "luxury" && "bg-gradient-to-tr from-amber-500 to-yellow-600 text-white ring-2 ring-amber-400/50 shadow-md shadow-amber-500/20",
          variant === "ai" && "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white ring-2 ring-purple-400/50 shadow-md shadow-purple-500/25"
        )}
      >
        {variant === "ai" && !src ? (
          <span className="text-amber-300 font-black">✦</span>
        ) : src && !hasError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setHasError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute rounded-full ring-2 ring-white dark:ring-slate-900",
            statusDotSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export interface AvatarGroupProps {
  avatars: { src?: string; name?: string; alt?: string }[];
  max?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = "sm",
  className,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div className={cn("flex items-center -space-x-2 overflow-hidden", className)}>
      {visible.map((av, i) => (
        <Avatar
          key={i}
          src={av.src}
          name={av.name}
          alt={av.alt}
          size={size}
          className="ring-2 ring-white dark:ring-slate-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold ring-2 ring-white dark:ring-slate-900",
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
