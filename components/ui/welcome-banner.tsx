import * as React from "react"
import { cn } from "@/lib/utils"
import { X, Calendar, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

export interface WelcomeBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  onDismiss?: () => void;
}

export function WelcomeBanner({ name, onDismiss, className, ...props }: WelcomeBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div 
      className={cn(
        "relative w-full h-[120px] rounded-[24px] overflow-hidden flex items-center justify-between p-[32px] border border-brand/10 shadow-sm",
        "bg-gradient-to-r from-[#EEF0FF] via-[#F4F5F8] to-white",
        className
      )} 
      {...props}
    >
      <div className="flex flex-col gap-2 z-10">
        <h2 className="text-[24px] font-semibold text-foreground tracking-tight flex items-center gap-2">
          Good morning, {name} <span className="inline-block animate-bounce origin-bottom">👋</span>
        </h2>
        <div className="flex items-center gap-4 text-[14px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-brand" />
            {today}
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-ai" />
            Your AI assistant has prepared 3 new recommendations.
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3 z-10">
        <Button variant="secondary" className="h-[40px] bg-white">
          View Schedule
        </Button>
        <Button variant="primary" className="h-[40px]">
          Start Sourcing
        </Button>
      </div>

      <button 
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-full text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={16} />
      </button>
    </div>
  )
}
