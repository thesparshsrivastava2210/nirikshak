import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-700 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3 py-1.5",
        sm: "h-7 px-2.5 py-1 text-[11px]",
        lg: "h-10 px-5 py-2 text-sm",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
