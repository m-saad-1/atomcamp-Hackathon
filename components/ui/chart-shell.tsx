import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
}

export function ChartShell({ title, description, headerAction, footer, children, className, ...props }: ChartShellProps) {
  return (
    <div className={cn("flex flex-col gap-4 p-[24px] bg-white rounded-[20px] shadow-sm", className)} {...props}>
      <div className="flex justify-between items-start">
        {(title || description) && (
          <div className="flex flex-col gap-1">
            {title && <h3 className="text-[20px] font-semibold text-foreground leading-none tracking-tight">{title}</h3>}
            {description && <p className="text-[14px] text-muted-foreground">{description}</p>}
          </div>
        )}
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="flex-1 w-full relative min-h-[200px] animate-in fade-in duration-1000">
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  )
}
