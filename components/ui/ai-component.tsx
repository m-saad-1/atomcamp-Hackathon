import * as React from "react"
import { SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export interface AIRecommendationProps extends React.HTMLAttributes<HTMLDivElement> {
  confidence: number;
  reasoning: string;
  evidence: string[];
  recommendation: string;
}

export function AIRecommendation({
  confidence,
  reasoning,
  evidence,
  recommendation,
  className,
  ...props
}: AIRecommendationProps) {
  return (
    <div className={cn("p-[24px] bg-ai-background border border-ai/20 rounded-card flex flex-col gap-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-ai font-semibold text-[16px]">
          <SparklesIcon size={20} strokeWidth={2} />
          <span>AI Insight</span>
        </div>
        <Badge variant="ai" className="font-semibold bg-ai text-white hover:bg-ai/90 border-none">
          {confidence}% Confidence
        </Badge>
      </div>
      
      <div className="flex flex-col gap-3 text-[14px]">
        <div>
          <span className="font-semibold text-foreground">Recommendation: </span>
          <span className="text-foreground">{recommendation}</span>
        </div>
        
        <div>
          <span className="font-semibold text-foreground">Reasoning: </span>
          <span className="text-muted-foreground">{reasoning}</span>
        </div>
        
        {evidence.length > 0 && (
          <div>
            <span className="font-semibold text-foreground">Evidence: </span>
            <ul className="list-disc pl-5 mt-1 text-muted-foreground space-y-1">
              {evidence.map((ev, idx) => (
                <li key={idx}>{ev}</li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="pt-2">
          <button className="h-[40px] px-4 bg-ai text-white rounded-button text-[14px] font-medium hover:bg-ai/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai focus-visible:ring-offset-2">
            Execute Recommendation
          </button>
        </div>
      </div>
    </div>
  )
}
