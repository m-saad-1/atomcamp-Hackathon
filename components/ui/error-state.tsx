import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon } from "lucide-react"

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  explanation: string;
  suggestedFix: string;
  onRetry: () => void;
}

export function ErrorState({
  explanation,
  suggestedFix,
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-[48px] text-center rounded-card border border-error-background bg-error-background/50", className)} {...props}>
      <AlertCircleIcon size={32} strokeWidth={2} className="text-error mb-4" />
      <h3 className="text-[18px] font-semibold text-error mb-1">{explanation}</h3>
      <p className="text-[14px] text-error/80 mb-6 max-w-[400px]">
        {suggestedFix}
      </p>
      <Button variant="danger" onClick={onRetry}>
        Retry
      </Button>
    </div>
  )
}
