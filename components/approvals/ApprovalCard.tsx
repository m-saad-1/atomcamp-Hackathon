'use client';

import { Approval } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, FileText, Send, UserPlus, GitMerge, Bell } from 'lucide-react';
import { useState } from 'react';

interface Props {
  approval: Approval;
  onAction: (id: string, action: 'approve' | 'reject' | 'skip') => Promise<void>;
}

export function ApprovalCard({ approval, onAction }: Props) {
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    switch (approval.action_type) {
      case 'send_email': return <Send className="h-5 w-5 text-blue-500" />;
      case 'create_candidate': return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'move_stage': return <GitMerge className="h-5 w-5 text-purple-500" />;
      case 'slack_notify': return <Bell className="h-5 w-5 text-yellow-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleAction = async (action: 'approve' | 'reject' | 'skip') => {
    setLoading(true);
    await onAction(approval.id, action);
    setLoading(false);
  };

  return (
    <Card className="bg-card/50">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background rounded-md border border-border">
            {getIcon()}
          </div>
          <div>
            <CardTitle className="text-base">{approval.preview_label}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(approval.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="capitalize">
          {approval.action_type.replace('_', ' ')}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/30 p-3 rounded-md text-sm border border-border">
          <pre className="whitespace-pre-wrap font-sans text-muted-foreground">
            {JSON.stringify(approval.action_payload, null, 2)}
          </pre>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t border-border pt-4">
        <Button variant="ghost" size="sm" onClick={() => handleAction('skip')} disabled={loading}>
          Skip
        </Button>
        <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleAction('reject')} disabled={loading}>
          <X className="mr-2 h-4 w-4" /> Reject
        </Button>
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => handleAction('approve')} disabled={loading}>
          <Check className="mr-2 h-4 w-4" /> Approve
        </Button>
      </CardFooter>
    </Card>
  );
}
