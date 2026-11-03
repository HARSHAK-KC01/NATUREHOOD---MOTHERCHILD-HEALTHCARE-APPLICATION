import * as React from "react";
import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground",
        "flex h-11 w-full min-w-0 rounded-xl border border-border/80 bg-white/90 dark:bg-card/90 px-3.5 py-2 text-sm shadow-2xs transition-all duration-150 outline-none",
        "focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/15",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
