import { useEffect, useRef } from "react";

import { cn } from "./utils";

interface DynamicWidthBarProps {
  percent: number;
  className?: string;
  ariaLabel?: string;
}

export function DynamicWidthBar({ percent, className, ariaLabel }: DynamicWidthBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const clampedPercent = Math.max(0, Math.min(100, percent));

  useEffect(() => {
    if (!barRef.current) {
      return;
    }

    barRef.current.style.width = `${clampedPercent}%`;
  }, [clampedPercent]);

  return (
    <div
      ref={barRef}
      className={cn("h-2 rounded-full transition-[width]", className)}
      role="presentation"
      aria-label={ariaLabel ?? `Progress ${clampedPercent}%`}
    />
  );
}
