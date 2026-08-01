import { 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  BrainCircuit,
  ArrowRight
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <div className="flex h-[120px] items-center justify-between overflow-hidden rounded-[24px] bg-gradient-to-r from-[#EEF0FF] to-[#F3E8FF] p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Good morning, Sarah</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thursday, Aug 1 — You have 3 candidates needing review today.</p>
        </div>
        <button className="rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-brand-primary shadow-sm hover:bg-gray-50 transition-colors">
          Review Candidates
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Candidates', value: '2,845', trend: '+12%', icon: Users, color: 'text-brand-primary' },
          { title: 'In Pipeline', value: '142', trend: '+5%', icon: TrendingUp, color: 'text-info' },
          { title: 'Interviews Today', value: '8', trend: '0%', icon: Clock, color: 'text-warning' },
          { title: 'Offers Accepted', value: '24', trend: '+18%', icon: UserCheck, color: 'text-success' },
        ].map((kpi) => (
          <div key={kpi.title} className="flex h-[150px] flex-col justify-between rounded-[20px] bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              <span className="text-sm font-medium text-muted-foreground">{kpi.title}</span>
            </div>
            <div>
              <div className="text-[36px] font-bold tracking-tight text-foreground">{kpi.value}</div>
              <div className="mt-1 text-[13px] font-medium text-success">{kpi.trend} from last month</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* Hiring Pipeline (2/3 width on xl) */}
        <div className="col-span-1 xl:col-span-2 flex h-[420px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Hiring Pipeline</h2>
            <button className="text-sm font-medium text-brand-primary hover:underline">View All</button>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-gray-50">
            <span className="text-sm text-muted-foreground">Pipeline visualization placeholder</span>
          </div>
        </div>

        {/* AI Activity (1/3 width on xl) */}
        <div className="col-span-1 flex h-[420px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-[#7C3AED]" />
              <h2 className="text-lg font-bold text-foreground">AI Copilot Activity</h2>
            </div>
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Settings</button>
          </div>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
            {/* Timeline Placeholder */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-secondary cursor-pointer">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E8FF] text-[#7C3AED]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">Drafted outreach email</span>
                  <span className="text-xs text-muted-foreground">For Senior React Developer role</span>
                  <span className="mt-1 text-[10px] font-medium text-[#7C3AED]">98% Confidence • 2m ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recruiting Health */}
        <div className="flex h-[320px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-foreground">Recruiting Health</h2>
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-gray-50">
            <span className="text-sm text-muted-foreground">Health metrics placeholder</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="flex h-[320px] flex-col rounded-[20px] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-foreground">Pending Approvals</h2>
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">Offer Approval</span>
                    <span className="text-xs text-muted-foreground">Michael Chen • Senior Designer</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-success-bg px-3 py-1.5 text-xs font-bold text-success hover:bg-green-100">Approve</button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold hover:bg-secondary">Review</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
