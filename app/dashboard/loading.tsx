import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8 pb-12 w-full animate-in fade-in duration-200">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-[120px] w-full rounded-[24px]" />

      {/* KPI Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-[150px] w-full rounded-[20px]" />
        ))}
      </div>

      {/* Main Analytics Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[420px] rounded-[20px]" />
        <Skeleton className="lg:col-span-4 h-[420px] rounded-[20px]" />
      </div>

      {/* Secondary Grid 1 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[240px] rounded-[20px]" />
        <Skeleton className="lg:col-span-4 h-[240px] rounded-[20px]" />
      </div>

      {/* Secondary Grid 2 Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[360px] rounded-[20px]" />
        <Skeleton className="lg:col-span-4 h-[360px] rounded-[20px]" />
      </div>
      
      {/* AI Recommendations Skeleton */}
      <Skeleton className="h-[200px] w-full rounded-[20px]" />

      {/* Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-8 h-[320px] rounded-[20px]" />
        <Skeleton className="lg:col-span-4 h-[320px] rounded-[20px]" />
      </div>
    </div>
  )
}
