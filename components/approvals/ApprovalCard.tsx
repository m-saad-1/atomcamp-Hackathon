import { useState } from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { Action } from '@/lib/actions/types';

interface ApprovalCardProps {
  action: any; // Using any for nested relations like candidates/jobs
  onProcess: (actionId: string, decision: 'approve' | 'reject' | 'modify', modifiedPlan?: any) => Promise<void>;
}

const ACTION_ICONS: Record<string, string> = {
  send_email:         '✉️',
  schedule_interview: '📅',
  reject_candidate:   '✗',
  slack_message:      '💬',
};

export function ApprovalCard({ action, onProcess }: ApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modifiedPlan, setModifiedPlan] = useState<any>(action.execution_plan);

  const handleDecision = async (decision: 'approve' | 'reject' | 'modify') => {
    setIsProcessing(true);
    await onProcess(action.id, decision, decision === 'modify' ? modifiedPlan : undefined);
    setIsProcessing(false);
    if (decision === 'modify') setIsEditing(false);
  };

  const riskColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const riskClass = riskColors[action.risk_level as keyof typeof riskColors] || riskColors.low;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm mb-4">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5">
          {ACTION_ICONS[action.action_type] || '⚙️'}
        </span>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">
              {action.candidates?.full_name || 'Unknown Candidate'}
            </h3>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${riskClass}`}>
              {action.risk_level} Risk
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {action.jobs?.title || 'General'} • {action.action_type.replace('_', ' ')}
          </p>

          {/* AI Context */}
          {action.recommendation && (
            <div className="mb-3">
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">AI Recommendation</span>
              <p className="text-sm text-foreground bg-indigo-50/50 p-2 rounded-md border border-indigo-100/50">
                {action.recommendation}
              </p>
            </div>
          )}

          {action.dependencies?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {action.dependencies.map((dep: string) => (
                <span key={dep} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 uppercase font-medium">
                  Dep: {dep.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}

          {isEditing ? (
            <div className="mb-3 mt-3">
              <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Edit Execution Plan</span>
              <textarea 
                className="w-full text-sm text-foreground bg-white p-2 rounded-md border border-input min-h-[100px]"
                value={typeof modifiedPlan === 'string' ? modifiedPlan : JSON.stringify(modifiedPlan, null, 2)}
                onChange={(e) => {
                   try {
                     setModifiedPlan(JSON.parse(e.target.value));
                   } catch {
                     setModifiedPlan(e.target.value);
                   }
                }}
              />
            </div>
          ) : (
             action.execution_plan && (
              <div className="mb-3 mt-3">
                <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">Execution Plan</span>
                <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-100 overflow-x-auto">
                  {JSON.stringify(action.execution_plan, null, 2)}
                </pre>
              </div>
             )
          )}

          <div className="flex items-center justify-between mt-2">
             {action.ai_confidence !== null && action.ai_confidence !== undefined && (
               <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                 Confidence: {action.ai_confidence}%
               </span>
             )}
             
             <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-blue-600 hover:underline">
               {isExpanded ? '▲ Hide details' : '▼ Show evidence & reasoning'}
             </button>
          </div>

          {isExpanded && (
            <div className="mt-3 p-3 bg-muted rounded-md text-xs space-y-2">
              {action.reasoning && (
                <div>
                  <span className="font-semibold block mb-1">Reasoning:</span>
                  <p>{action.reasoning}</p>
                </div>
              )}
              {action.supporting_evidence && (
                <div>
                  <span className="font-semibold block mb-1">Evidence:</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap">{JSON.stringify(action.supporting_evidence, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/50">
        {['completed', 'failed', 'rejected'].includes(action.execution_status) ? (
           <span className="text-sm font-medium uppercase text-muted-foreground px-4 py-1.5">
             Status: {action.execution_status}
           </span>
        ) : (
          <>
            <button
              onClick={() => handleDecision('reject')}
              disabled={isProcessing}
              className="flex items-center rounded-lg border border-red-200 px-4 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <X className="w-3 h-3 mr-1.5" />}
              Reject
            </button>

            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="text-xs text-muted-foreground px-3 hover:underline">Cancel</button>
                <button
                  onClick={() => handleDecision('modify')}
                  disabled={isProcessing}
                  className="flex items-center rounded-lg bg-indigo-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Check className="w-3 h-3 mr-1.5" />}
                  Save & Approve
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isProcessing}
                  className="flex items-center rounded-lg border border-border bg-white px-4 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Modify
                </button>
                <button
                  onClick={() => handleDecision('approve')}
                  disabled={isProcessing}
                  className="flex items-center rounded-lg bg-indigo-600 text-white px-4 py-1.5 text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Check className="w-3 h-3 mr-1.5" />}
                  Approve Action
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
