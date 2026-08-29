import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "teal"
    | "blue"
    | "orange"
    | "purple"
    | "green"
    | "amber"
    | "gray"
    | "red";
}

export function Badge({
  className,
  variant = "teal",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    teal: "bg-teal-50 text-tertiary border-teal-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    red: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
