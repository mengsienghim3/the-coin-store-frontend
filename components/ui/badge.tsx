import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-purple-600 text-white shadow",
        tourbillon:
          "border border-purple-400/40 bg-purple-500/15 text-purple-300 backdrop-blur-md shadow-sm shadow-purple-500/10",
        hypercar:
          "border border-pink-400/40 bg-pink-500/15 text-pink-300 backdrop-blur-md shadow-sm shadow-pink-500/10",
        ruby: "border border-rose-500/40 bg-rose-500/15 text-rose-300 backdrop-blur-md",
        titanium: "border border-slate-700 bg-slate-800/80 text-slate-300",
        outline: "border border-white/20 text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
