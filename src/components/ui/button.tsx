import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/30 active:scale-[0.98] select-none cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-primary/25 hover:shadow-md",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/95 hover:shadow-destructive/25 hover:shadow-md",
        outline:
          "border border-border/80 bg-white/90 dark:bg-card/90 text-foreground hover:bg-muted/70 hover:border-border shadow-2xs hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/95 hover:shadow-secondary/25 hover:shadow-md",
        ghost:
          "hover:bg-muted/80 text-muted-foreground hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto font-medium",
        glass: "bg-white/70 dark:bg-card/70 backdrop-blur-md border border-white/30 text-foreground shadow-xs hover:bg-white/90",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3.5",
        sm: "h-8 rounded-lg gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-xl px-6 text-base has-[>svg]:px-4 font-bold shadow-md",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
