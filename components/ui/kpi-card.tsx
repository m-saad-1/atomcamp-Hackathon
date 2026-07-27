"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { LineChart, Line, ResponsiveContainer } from "recharts"

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  sparklineData?: { value: number }[];
}

export function KPICard({ icon: Icon, title, value, trend, trendLabel, sparklineData, className, ...props }: KPICardProps) {
  // Generate some dummy data if sparklineData is missing but we want to show a trend
  const data = sparklineData || [
    { value: 40 }, { value: 30 }, { value: 45 }, { value: 50 }, { value: 48 }, { value: 60 }, { value: trend && trend < 0 ? 50 : 70 }
  ];

  const trendColor = trend && trend >= 0 ? "var(--success)" : "var(--error)";

  return (
    <div className={cn("p-[24px] bg-white rounded-[20px] shadow-sm flex flex-col gap-3 h-[150px] hover:-translate-y-[2px] hover:shadow-md transition-all duration-[180ms]", className)} {...props}>
      <div className="flex items-center gap-2 text-muted-foreground shrink-0">
        <Icon size={20} strokeWidth={2} />
        <span className="text-[14px] font-medium">{title}</span>
      </div>
      <div className="text-[36px] font-bold text-foreground leading-none tracking-tight shrink-0">
        {value}
      </div>
      
      <div className="flex items-end justify-between mt-auto pt-2 gap-4">
        {trend !== undefined && (
          <div className="flex flex-col gap-1">
            <div className={cn("flex items-center text-[12px] font-semibold", trend >= 0 ? "text-success" : "text-error")}>
              {trend >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {Math.abs(trend)}%
            </div>
            {trendLabel && <span className="text-[12px] text-muted-foreground whitespace-nowrap">{trendLabel}</span>}
          </div>
        )}
        
        {trend !== undefined && (
          <div className="h-[32px] w-[80px] ml-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={trendColor} 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
