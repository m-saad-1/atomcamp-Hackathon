import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/auth';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const revalidate = 0;

export default async function DuplicatesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const supabase = createAdminClient();
  const { data: candidates } = await supabase
    .from('candidates')
    .select('*')
    .eq('duplicate_status', 'pending_review')
    .eq('organization_id', session.user.organization_id)
    .order('created_at', { ascending: false });

  return (
    <main className="p-6 max-w-6xl mx-auto" aria-labelledby="page-title">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 id="page-title" className="text-xl font-semibold text-foreground">Duplicate Resolution</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manually review candidates with medium-confidence matches.
          </p>
        </div>
        <Badge variant="secondary">{candidates?.length || 0} Pending</Badge>
      </div>

      {!candidates || candidates.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium mb-2">No duplicates pending review</p>
          <p className="text-sm">The candidate extraction engine will flag uncertain matches here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-card border rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{candidate.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{candidate.email || 'No email'}</p>
                </div>
                <div className="flex gap-2">
                  {/* These buttons would typically trigger an API to merge or unflag. 
                      For now, we just link to the candidate profile so they can review it manually */}
                  <Link href={`/dashboard/candidates/${candidate.id}`}>
                    <button className="text-sm border px-3 py-1.5 rounded-md hover:bg-muted">Review Details</button>
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div><strong>Role:</strong> {candidate.current_role} at {candidate.current_company}</div>
                <div><strong>Location:</strong> {candidate.location}</div>
                <div><strong>LinkedIn:</strong> {candidate.linkedin_url || 'N/A'}</div>
                <div><strong>Phone:</strong> {candidate.phone || 'N/A'}</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {candidate.skills?.slice(0, 5).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
