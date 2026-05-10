import { createServerClient } from '@/lib/supabase/server';
import { InboxPanel } from '@/components/inbox/InboxPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { syncEmailsAction } from './actions';

export const revalidate = 0;

export default async function InboxPage() {
  const supabase = createServerClient();
  
  const { data: emails } = await supabase
    .from('emails')
    .select('*')
    .eq('processed', false)
    .order('received_at', { ascending: false });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recruiter Inbox</h1>
          <p className="text-muted-foreground mt-2">
            Incoming applicant emails awaiting AI processing.
          </p>
        </div>
        <form action={syncEmailsAction}>
          <Button type="submit" variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Check Mail
          </Button>
        </form>
      </div>

      <InboxPanel initialEmails={emails || []} />
    </div>
  );
}
