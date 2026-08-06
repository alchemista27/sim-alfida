import React from "react";
import { cn } from "@/lib/utils";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  className?: string;
  filled?: boolean;
}

export function Icon({ name, className, filled = false, ...props }: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-rounded select-none inline-block align-middle",
        className
      )}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
      }}
      {...props}
    >
      {name}
    </span>
  );
}
