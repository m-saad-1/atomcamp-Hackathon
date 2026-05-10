'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertCircle, FileText, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Email {
  id: string;
  sender_name: string | null;
  sender_email: string;
  subject: string;
  has_attachment: boolean;
  received_at: string;
  processed: boolean;
  ai_classification: string | null;
}

export function InboxPanel({ initialEmails }: { initialEmails: Email[] }) {
  const [emails, setEmails] = useState(initialEmails);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleProcess = async (id: string) => {
    setProcessing(id);
    try {
      toast({
        title: "Processing Email",
        description: "The AI agent is analysing the email and attachments...",
      });
      
      const response = await fetch(`/api/emails/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // The API expects attachment_buffer, but since we disabled passing it from the poller,
          // the backend api/emails/[id]/route.ts needs to be able to process it without it if it's not a resume,
          // OR the API should fetch it again from Gmail using the gmail_message_id.
          // Wait, if we don't pass the buffer, how does the API parse the resume?
          // I will modify api/emails/[id]/route.ts to download it on demand.
        }),
      });

      if (!response.ok) {
        throw new Error('Pipeline failed');
      }
      
      toast({
        title: "Processed Successfully",
        description: "Candidate profile generated and added to approvals.",
      });

      setEmails(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      toast({
        title: "Processing Failed",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (emails.length === 0) {
    return (
      <div className="text-center py-20 bg-card/50 rounded-xl border border-border">
        <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-foreground">Inbox Zero!</h3>
        <p className="text-muted-foreground mt-1">All incoming emails have been processed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map(email => (
        <Card key={email.id} className="bg-card/50 hover:bg-card transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="bg-primary/10 p-2 rounded-full shrink-0">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground truncate">
                    {email.sender_name || email.sender_email}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    &lt;{email.sender_email}&gt;
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto shrink-0">
                    {new Date(email.received_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground truncate font-medium">
                  {email.subject}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {email.has_attachment && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      <FileText className="w-3 h-3 mr-1" /> Resume Attached
                    </Badge>
                  )}
                  {email.ai_classification && (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-500">
                      <Bot className="w-3 h-3 mr-1" /> {email.ai_classification.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="ml-6 shrink-0">
              <Button 
                onClick={() => handleProcess(email.id)}
                disabled={processing === email.id}
              >
                {processing === email.id ? 'Processing...' : 'Process with AI'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
