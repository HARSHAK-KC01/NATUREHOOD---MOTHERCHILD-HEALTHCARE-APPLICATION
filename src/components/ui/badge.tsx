import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none transition-all duration-150 select-none shadow-2xs",
  {
    variants: {
      variant: {
        default:
          "border-primary/20 bg-primary/10 text-primary [a&]:hover:bg-primary/20",
        primary:
          "border-transparent bg-primary text-white shadow-xs [a&]:hover:bg-primary/90",
        secondary:
          "border-secondary/20 bg-secondary/10 text-secondary [a&]:hover:bg-secondary/20",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive [a&]:hover:bg-destructive/20",
        outline:
          "border-border/80 bg-white/80 dark:bg-card/80 text-foreground [a&]:hover:bg-muted",
        success:
          "border-emerald-500/20 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
        warning:
          "border-amber-500/20 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
