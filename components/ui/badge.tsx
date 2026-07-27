import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 border-transparent",
  {
    variants: {
      variant: {
        primary: "bg-brand/10 text-brand",
        success: "bg-success-background text-success",
        warning: "bg-warning-background text-warning",
        error: "bg-error-background text-error",
        ai: "bg-ai-background text-ai",
        info: "bg-info-background text-info",
        
        // Aliases for compatibility
        default: "bg-brand/10 text-brand",
        secondary: "bg-muted text-foreground",
        destructive: "bg-error-background text-error",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
