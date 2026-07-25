"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Scale, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface CandidateComparisonDialogProps {
  candidateId: string;
  jobId?: string;
}

export function CandidateComparisonDialog({ candidateId, jobId }: CandidateComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [comparison, setComparison] = useState<{
    comparisonMatrix: Array<{
      candidateId: string;
      candidateName: string;
      skillsSummary: string;
      experienceSummary: string;
      pros: string[];
      cons: string[];
      fitScore: number;
    }>;
    recommendation: string;
  } | null>(null);

  const handleCompare = async () => {
    if (!jobId) {
      toast.error("Job ID is required to compare candidates against competitors");
      return;
    }
    
    setIsLoading(true);
    try {
      const compareRes = await fetch("/api/copilot/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          jobId
        }),
      });

      if (!compareRes.ok) {
         const errText = await compareRes.text();
         throw new Error(errText || "Failed to generate comparison");
      }
      
      const data = await compareRes.json();
      setComparison(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate candidate comparison");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={!jobId}>
          <Scale className="h-4 w-4" />
          Compare
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Candidate Comparison</DialogTitle>
          <DialogDescription>
            AI-generated comparison against other candidates for this job.
          </DialogDescription>
        </DialogHeader>
        
        {!comparison ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Scale className="h-12 w-12 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">This will compare the current candidate with top competitors for the same job.</p>
            <Button onClick={handleCompare} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Run Analysis
            </Button>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comparison.comparisonMatrix?.map((c, idx: number) => (
                <div key={idx} className={`p-4 border rounded-xl ${c.candidateId === candidateId ? 'border-primary bg-primary/5' : 'bg-card'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{c.candidateName} {c.candidateId === candidateId && "(Current)"}</h3>
                    <Badge variant={c.fitScore > 80 ? 'default' : 'secondary'}>Fit: {c.fitScore}%</Badge>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Skills</h4>
                      <p className="text-sm">{c.skillsSummary}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Experience</h4>
                      <p className="text-sm">{c.experienceSummary}</p>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <h4 className="text-xs font-semibold uppercase text-green-600 mb-1 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Pros</h4>
                      <ul className="text-xs list-disc pl-4 space-y-1">
                        {c.pros?.map((p, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold uppercase text-red-600 mb-1 flex items-center gap-1"><XCircle className="w-3 h-3"/> Cons</h4>
                      <ul className="text-xs list-disc pl-4 space-y-1">
                        {c.cons?.map((p, i: number) => <li key={i}>{p}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" /> Recommendation
              </h4>
              <p className="text-sm">{comparison.recommendation}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
