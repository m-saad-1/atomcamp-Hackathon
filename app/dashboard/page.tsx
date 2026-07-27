"use client"
import * as React from 'react';
import { useSession } from 'next-auth/react';
import { Users, Mail, CheckCircle2, Zap, BrainCircuit, ChevronRight, Clock, Check, X, Filter, Download, MoreHorizontal } from 'lucide-react';
import { KPICard } from '@/components/ui/kpi-card';
import { ChartShell } from '@/components/ui/chart-shell';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIRecommendation } from '@/components/ui/ai-component';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { WelcomeBanner } from '@/components/ui/welcome-banner';
import { cn } from '@/lib/utils';

const pipelineData = [
  { name: 'Sourced', count: 1200 },
  { name: 'Screening', count: 450 },
  { name: 'Interview', count: 200 },
  { name: 'Offer', count: 45 },
  { name: 'Hired', count: 28 },
];

const healthStatuses = [
  { service: 'API Gateway', status: 'healthy', ms: '45ms' },
  { service: 'Email Provider', status: 'healthy', ms: '120ms' },
  { service: 'AI Model Layer', status: 'degraded', ms: '1.2s' },
  { service: 'Storage (S3)', status: 'healthy', ms: '80ms' },
  { service: 'ATS Sync', status: 'healthy', ms: '150ms' }
];

const aiActivityData = [
  { action: 'Drafted follow-up email', target: 'Sarah Jenkins', time: '12m ago', status: 'Pending', conf: 92 },
  { action: 'Screened Resume', target: 'David Kumar', time: '24m ago', status: 'Completed', conf: 98 },
  { action: 'Scheduled Interview', target: 'Emma Watson', time: '1h ago', status: 'Completed', conf: 95 },
];

const pendingApprovalsData = [
  { id: 1, type: 'Offer Letter', name: 'James Smith', priority: 'High' },
  { id: 2, type: 'Interview Panel', name: 'Emma Watson', priority: 'Normal' },
  { id: 3, type: 'Sourcing Campaign', name: 'Senior Devs', priority: 'Normal' },
  { id: 4, type: 'Offer Letter', name: 'Michael Chen', priority: 'High' },
];

const recentCandidatesData = [
  { name: 'Michael Chen', role: 'Frontend Engineer', stage: 'Interview', initial: 'M', score: 94, owner: 'Sarah J.', updated: '2h ago' },
  { name: 'Emma Watson', role: 'Product Manager', stage: 'Screening', initial: 'E', score: 88, owner: 'Mark T.', updated: '4h ago' },
  { name: 'James Smith', role: 'Backend Engineer', stage: 'Offer', initial: 'J', score: 96, owner: 'Alice R.', updated: '1d ago' },
];

const upcomingInterviewsData = [1, 2, 3];

const teamActivityData = [
  { name: 'Sarah J.', action: 'moved Michael Chen to Interview', time: '10m ago' },
  { name: 'Mark T.', action: 'published Frontend Engineer role', time: '1h ago' },
  { name: 'Alice R.', action: 'left feedback for Emma Watson', time: '2h ago' },
];

const recruitingHealthMetrics = [
  { name: 'Time to fill', value: 90 },
  { name: 'Offer acceptance', value: 85 },
  { name: 'Candidate NPS', value: 95 }
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const orgName = 'Recrion Demo Org';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-200 pb-12">
      
      {/* 1. Welcome Banner */}
      <WelcomeBanner name={session?.user?.name?.split(' ')[0] ?? 'Recruiter'} />

      {/* 2. KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard icon={Users} title="Active Candidates" value="2,420" trend={12.5} trendLabel="vs last month" sparklineData={[{value: 2000}, {value: 2100}, {value: 2300}, {value: 2200}, {value: 2420}]} />
        <KPICard icon={Mail} title="Emails Sent (AI)" value="1,845" trend={34.2} trendLabel="vs last month" sparklineData={[{value: 1200}, {value: 1500}, {value: 1400}, {value: 1700}, {value: 1845}]} />
        <KPICard icon={CheckCircle2} title="Interviews Scheduled" value="142" trend={-2.4} trendLabel="vs last month" sparklineData={[{value: 160}, {value: 155}, {value: 150}, {value: 145}, {value: 142}]} />
        <KPICard icon={Zap} title="Time to Hire" value="18d" trend={15.0} trendLabel="improvement" sparklineData={[{value: 22}, {value: 21}, {value: 20}, {value: 19}, {value: 18}]} />
      </div>

      {/* 3. Main Analytics Grid (Asymmetrical) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hiring Pipeline (Primary Anchor) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <ChartShell 
            title="Hiring Pipeline" 
            description="Candidate conversion across stages over the last 30 days" 
            className="h-full min-h-[420px]"
            headerAction={
              <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center gap-1.5 h-8">
                <Filter size={14} /> Filter
              </Button>
            }
            footer={
              <div className="flex items-center justify-between w-full">
                <Button variant="ghost" size="sm" className="text-brand h-8 px-0 hover:bg-transparent hover:text-brand-hover">
                  View full report
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground flex items-center gap-1.5 h-8">
                  <Download size={14} /> Export CSV
                </Button>
              </div>
            }
          >
             <div className="w-full h-[320px] pt-4">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={pipelineData} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                   <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                   <Tooltip 
                     cursor={{ fill: 'var(--bg-tertiary)' }}
                     contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
                   />
                   <Bar dataKey="count" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} barSize={24} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </ChartShell>
        </div>
        
        {/* AI Activity (Operational Feed) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-4 border-b border-border shrink-0">
              <CardTitle className="text-[18px] flex items-center justify-between">
                <span>AI Activity</span>
                <Badge variant="ai">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-0 flex-1 overflow-hidden">
              <div 
                className="flex flex-col h-full overflow-y-auto"
                style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
              >
                 {aiActivityData.map((item, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors group">
                     <div className="bg-ai-background p-2 rounded-full mt-0.5 shrink-0 text-ai">
                       <BrainCircuit size={16} />
                     </div>
                     <div className="flex flex-col gap-1 flex-1 min-w-0">
                       <div className="flex justify-between items-start gap-2">
                         <p className="text-[14px] text-foreground font-medium truncate">{item.action}</p>
                         <Badge variant={item.status === 'Pending' ? 'warning' : 'success'} className="shrink-0 scale-90 origin-right">
                           {item.status}
                         </Badge>
                       </div>
                       <p className="text-[13px] text-muted-foreground truncate">Target: {item.target} • {item.conf}% Conf.</p>
                       <div className="flex justify-between items-center mt-1">
                         <span className="text-[12px] text-muted-foreground whitespace-nowrap">{item.time}</span>
                         <Button variant="ghost" size="sm" className="h-6 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                           Open <ChevronRight size={14} className="ml-1" />
                         </Button>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Secondary Grid 1: Recruiting Health & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recruiting Health */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-[18px]">Recruiting Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="text-[48px] font-bold text-success leading-none">92</div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-medium text-foreground">Overall Score</span>
                  <span className="text-[13px] text-muted-foreground">Excellent. Pipeline is converting 15% faster than average.</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-4">
                {recruitingHealthMetrics.map(metric => (
                  <div key={metric.name} className="flex flex-col gap-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium text-foreground">{metric.name}</span>
                      <span className="text-muted-foreground">Top 10%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${metric.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="pb-4 shrink-0">
            <CardTitle className="text-[18px]">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent 
            className="flex-1 overflow-y-auto p-0 px-6 pb-6 space-y-4"
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
          >
            {pendingApprovalsData.map((approval) => (
              <div key={approval.id} className="flex items-center justify-between p-3 rounded-[12px] bg-white border border-border shadow-sm">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-foreground truncate">{approval.type}</p>
                    {approval.priority === 'High' && <div className="w-1.5 h-1.5 rounded-full bg-error" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate">{approval.name}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-success hover:bg-success-bg hover:text-success">
                    <Check size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-error hover:bg-error-bg hover:text-error">
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. Secondary Grid 2: Recent Candidates & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Candidates */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-[18px]">Recent Candidates</CardTitle>
            <Button variant="ghost" size="sm" asChild className="h-8">
              <Link href="/dashboard/candidates" className="text-brand flex items-center gap-1">
                View all <ChevronRight size={16} />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-[24px]">Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="pr-[24px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCandidatesData.map((c) => (
                  <TableRow key={c.name} className="hover:bg-muted/50 transition-colors h-[56px]">
                    <TableCell className="font-medium pl-[24px]">
                      <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full bg-muted flex items-center justify-center text-foreground font-semibold shrink-0">
                          {c.initial}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.role}</TableCell>
                    <TableCell>
                      <Badge variant={c.stage === 'Offer' ? 'success' : c.stage === 'Interview' ? 'info' : 'warning'}>
                        {c.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-ai">{c.score}</TableCell>
                    <TableCell className="text-muted-foreground">{c.owner}</TableCell>
                    <TableCell className="text-muted-foreground text-[13px]">{c.updated}</TableCell>
                    <TableCell className="pr-[24px] text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-[18px]">Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingInterviewsData.map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-[12px] bg-white border border-border shadow-sm">
                <div className="bg-muted p-2 rounded-[10px] text-center min-w-[48px] flex flex-col items-center justify-center">
                  <span className="text-[11px] text-muted-foreground font-semibold uppercase leading-none mb-1">Oct</span>
                  <span className="text-[18px] font-bold text-foreground leading-none">{12 + i}</span>
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">David Kumar</p>
                  <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground truncate">
                    <Clock size={14} /> 2:00 PM • Zoom • with Sarah J.
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 6. AI Recommendations (Full Width) */}
      <div className="grid grid-cols-1 gap-6">
        <AIRecommendation
          confidence={94}
          recommendation="Fast-track Sarah Jenkins to final round."
          reasoning="Candidate matches 100% of core technical requirements and responded to the AI screen in top 5% time. Historically this pattern results in a 80% offer acceptance rate."
          evidence={[
            "Passed React technical assessment with 98% score",
            "10+ years matching system architecture experience",
            "Currently active on market (responded in 14m)"
          ]}
        />
      </div>

      {/* 7. Bottom Grid: Team Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team Activity */}
        <Card className="lg:col-span-8 flex flex-col">
          <CardHeader className="pb-4 shrink-0 border-b border-border">
            <CardTitle className="text-[18px]">Team Activity</CardTitle>
          </CardHeader>
          <CardContent 
            className="flex-1 overflow-y-auto p-0 px-6 py-6 space-y-4"
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
          >
            {teamActivityData.map((act, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold text-[12px] shrink-0">
                  {act.name.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-[13px] text-foreground"><span className="font-semibold">{act.name}</span> {act.action}</p>
                  <span className="text-[11px] text-muted-foreground">{act.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader className="pb-4 shrink-0 border-b border-border">
            <CardTitle className="text-[18px]">System Status</CardTitle>
          </CardHeader>
          <CardContent 
            className="flex-1 overflow-y-auto p-0 px-6 py-6"
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 90%, transparent 100%)' }}
          >
            <ul className="space-y-4">
              {healthStatuses.map(health => (
                <li key={health.service} className="flex justify-between items-center text-[14px]">
                  <span className="font-medium text-foreground">{health.service}</span>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", 
                      health.status === 'healthy' ? 'bg-success' : 
                      health.status === 'degraded' ? 'bg-warning' : 
                      'bg-error'
                    )} />
                    <span className="text-[12px] text-muted-foreground">
                      {health.ms}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
