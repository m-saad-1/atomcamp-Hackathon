"use client";

import { useState, useRef, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { CopilotResponseSchema, CopilotResponse } from "@/lib/ai/copilot-prompts";
import { Send, Sparkles, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { DraftEmailDialog } from "./DraftEmailDialog";
import { CandidateComparisonDialog } from "./CandidateComparisonDialog";

interface CopilotPanelProps {
  candidateId: string;
  jobId?: string;
  className?: string;
}

type Message = 
  | { role: "user"; content: string }
  | { role: "assistant"; content: Partial<CopilotResponse> };

export function CopilotPanel({ candidateId, jobId, className }: CopilotPanelProps) {
  const [sessionId, setSessionId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/candidates/${candidateId}/chat`);
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.sessionId);
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history", err);
      } finally {
        setIsInitializing(false);
      }
    }
    loadHistory();
  }, [candidateId]);

  const { submit, object, isLoading, error } = useObject({
    api: `/api/candidates/${candidateId}/chat`,
    schema: CopilotResponseSchema,
    onFinish: (event) => {
      if (event.object) {
        setMessages((prev) => [...prev, { role: "assistant", content: event.object as CopilotResponse }]);
      }
    },
    onError: (err) => {
      console.error("Copilot Error:", err);
    }
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, object]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    submit({ message: input, sessionId, jobId });
    setInput("");
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (isLoading) return;
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    submit({ message: prompt, sessionId, jobId });
  };

  const renderAssistantMessage = (msg: Partial<CopilotResponse>, isStreaming: boolean) => {
    return (
      <div className="flex flex-col space-y-3 bg-muted/40 p-4 rounded-xl border border-muted">
        {/* Answer */}
        <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
          {msg.answer || (isStreaming && <span className="animate-pulse">Thinking...</span>)}
        </div>

        {/* Confidence & Explainability Row */}
        {(msg.confidence !== undefined || msg.reasoning) && (
          <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-border/50 items-center">
            {msg.confidence !== undefined && (
              <Badge variant={msg.confidence > 80 ? "default" : msg.confidence > 50 ? "secondary" : "destructive"} className="text-[10px] font-mono">
                {msg.confidence}% Confident
              </Badge>
            )}
            
            {msg.evidence && msg.evidence.length > 0 && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                {msg.evidence.length} Sources
              </Badge>
            )}
          </div>
        )}

        {/* Reasoning Details (Expander) */}
        {(msg.reasoning || msg.limitations || (msg.missing_information && msg.missing_information.length > 0)) && (
          <div className="text-xs text-muted-foreground bg-background p-3 rounded-md border mt-2 space-y-2">
            {msg.reasoning && (
              <div>
                <span className="font-semibold block mb-1">Reasoning:</span>
                <p>{msg.reasoning}</p>
              </div>
            )}
            {msg.limitations && (
              <div>
                <span className="font-semibold block mb-1 text-orange-600">Limitations:</span>
                <p>{msg.limitations}</p>
              </div>
            )}
            {msg.missing_information && msg.missing_information.length > 0 && (
              <div>
                <span className="font-semibold block mb-1 text-blue-600">Missing Info:</span>
                <ul className="list-disc list-inside">
                  {msg.missing_information.map((info, idx) => (
                    <li key={idx}>{info}</li>
                  ))}
                </ul>
              </div>
            )}
            {msg.evidence && msg.evidence.length > 0 && (
              <div>
                <span className="font-semibold block mb-1">Evidence Sources:</span>
                <ul className="list-disc list-inside opacity-80">
                  {msg.evidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Suggested Actions */}
        {msg.suggested_actions && msg.suggested_actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
            {msg.suggested_actions.map((action, idx) => (
              <button
                key={idx}
                className="text-[10px] uppercase font-semibold text-primary hover:bg-primary/10 border border-primary/20 px-2 py-1 rounded transition-colors"
                onClick={() => handleSuggestedPrompt(action)}
                disabled={isStreaming}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[600px] max-h-[80vh] border rounded-xl shadow-sm bg-card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-foreground">Recruiter Copilot</h3>
        </div>
        <div className="flex items-center gap-2">
          <CandidateComparisonDialog candidateId={candidateId} jobId={jobId} />
          <DraftEmailDialog candidateId={candidateId} jobId={jobId} sessionId={sessionId} />
        </div>
      </div>

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {isInitializing ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Loading context...</p>
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">How can I help evaluate this candidate?</p>
              <p className="text-sm text-muted-foreground mt-1">I can summarize their profile, compare them against the job description, or help prepare interview questions.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
              <Button variant="outline" className="justify-start text-xs h-8" onClick={() => handleSuggestedPrompt("Summarize the candidate's key strengths")}>
                Summarize key strengths
              </Button>
              <Button variant="outline" className="justify-start text-xs h-8" onClick={() => handleSuggestedPrompt("What are the biggest risk indicators?")}>
                Identify risk indicators
              </Button>
              <Button variant="outline" className="justify-start text-xs h-8" onClick={() => handleSuggestedPrompt("Generate 3 behavioral interview questions")}>
                Generate interview questions
              </Button>
            </div>
          </div>
        ) : null}

        <div className="space-y-6">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "user" ? (
                <div className="bg-primary text-primary-foreground text-sm py-2 px-4 rounded-2xl max-w-[85%] shadow-sm">
                  {m.content}
                </div>
              ) : (
                <div className="max-w-[95%] w-full">
                  {renderAssistantMessage(m.content as Partial<CopilotResponse>, false)}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[95%] w-full">
                {renderAssistantMessage(object || {}, true)}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Failed to generate response. Please try again.
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-background border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask about this candidate..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isInitializing}
            className="flex-1 focus-visible:ring-indigo-500 rounded-full bg-muted/50 border-transparent focus:border-indigo-500"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading || isInitializing} className="rounded-full bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
