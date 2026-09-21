import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:shadow-amber-500/30',
        tourbillon:
          'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 hover:opacity-95 hover:shadow-amber-500/40 border border-amber-300/40',
        hypercar:
          'bg-slate-900/80 hover:bg-slate-800 text-white border border-cyan-400/40 hover:border-cyan-400 shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 hover:text-cyan-300',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/10',
        outline:
          'border border-white/15 bg-transparent hover:bg-white/10 hover:text-white text-slate-300',
        ghost:
          'hover:bg-white/10 hover:text-white text-slate-300',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-lg px-3 text-[11px]',
        lg: 'h-12 rounded-2xl px-6 text-sm',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
