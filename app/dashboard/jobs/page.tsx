import { createAdminClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const revalidate = 0;

export default async function JobsPage() {
  const supabase = createAdminClient();
  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Open Roles</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs?.map(job => (
          <Card key={job.id} className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 hover:bg-card">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.location} • {job.remote_ok ? 'Remote' : 'On-site'}</p>
                </div>
                <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>
                  {job.status}
                </Badge>
              </div>
              
              <div className="flex gap-2 flex-wrap mb-4">
                {job.required_skills?.slice(0, 3).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="bg-background">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!jobs || jobs.length === 0) && (
        <div className="text-center py-20 text-muted-foreground">
          No jobs found. Add jobs directly to the Supabase database.
        </div>
      )}
    </div>
  );
}
