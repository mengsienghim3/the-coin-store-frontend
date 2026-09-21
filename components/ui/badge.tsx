import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-amber-500 text-slate-950 shadow',
        tourbillon:
          'border border-amber-400/40 bg-amber-500/15 text-amber-300 backdrop-blur-md shadow-sm shadow-amber-500/10',
        hypercar:
          'border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-500/10',
        ruby:
          'border border-rose-500/40 bg-rose-500/15 text-rose-300 backdrop-blur-md',
        titanium:
          'border border-slate-700 bg-slate-800/80 text-slate-300',
        outline: 'border border-white/20 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
