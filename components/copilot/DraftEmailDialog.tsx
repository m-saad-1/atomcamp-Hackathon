"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface DraftEmailDialogProps {
  candidateId: string;
  jobId?: string;
  sessionId?: string;
}

export function DraftEmailDialog({ candidateId, jobId, sessionId }: DraftEmailDialogProps) {
  const [open, setOpen] = useState(false);
  const [draftType, setDraftType] = useState("follow_up");
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<{ subject: string; body: string } | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/copilot/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          jobId,
          sessionId,
          draftType,
          parameters: {}
        }),
      });

      if (!res.ok) throw new Error("Failed to generate draft");
      
      const data = await res.json();
      setDraft(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate email draft");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Draft Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Copilot Email Draft</DialogTitle>
          <DialogDescription>
            Generate a context-aware email for this candidate.
          </DialogDescription>
        </DialogHeader>
        
        {!draft ? (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Email Type</Label>
              <Select value={draftType} onValueChange={setDraftType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="follow_up">Follow Up</SelectItem>
                  <SelectItem value="interview_invite">Interview Invite</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                  <SelectItem value="offer">Offer Extension</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Draft
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <Input value={draft.subject} onChange={(e) => setDraft({...draft, subject: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Body</Label>
              <Textarea 
                value={draft.body} 
                onChange={(e) => setDraft({...draft, body: e.target.value})} 
                className="min-h-[200px]"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDraft(null)}>Discard</Button>
              <Button onClick={() => {
                navigator.clipboard.writeText(draft.body);
                toast.success("Draft copied to clipboard!");
                setOpen(false);
              }}>Copy & Close</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
