import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-[48px] text-center rounded-card border border-dashed border-border bg-background-tertiary", className)} {...props}>
      <div className="h-[48px] w-[48px] rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
        <Icon size={24} strokeWidth={2} className="text-muted-foreground" />
      </div>
      <h3 className="text-[18px] font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-[14px] text-muted-foreground mb-6 max-w-[400px]">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
