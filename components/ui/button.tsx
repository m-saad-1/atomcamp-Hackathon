import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-[14px] font-medium transition-all duration-[120ms] hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-brand text-primary-foreground hover:bg-brand-hover shadow-sm",
        secondary: "bg-white border border-input text-foreground shadow-sm hover:bg-muted",
        ghost: "hover:bg-muted text-foreground",
        danger: "bg-error text-primary-foreground shadow-sm hover:bg-error/90",
        ai: "bg-ai text-primary-foreground shadow-sm hover:bg-ai/90",
        // Aliases for compatibility
        default: "bg-brand text-primary-foreground hover:bg-brand-hover shadow-sm",
        destructive: "bg-error text-primary-foreground shadow-sm hover:bg-error/90",
        outline: "border border-input bg-white hover:bg-muted text-foreground",
        link: "text-brand underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[44px] px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-12 px-8",
        icon: "h-[40px] w-[40px] rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
