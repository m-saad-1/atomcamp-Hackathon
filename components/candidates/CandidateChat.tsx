'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/lib/types/schemas';

interface Props {
  candidateId: string;
  candidateName: string;
}

export function CandidateChat({ candidateId, candidateName }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [briefingDone, setBriefingDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll to bottom on new messages ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // ── Load history or trigger auto-briefing on mount ─────────────────────────
  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/candidates/${candidateId}/chat`);
      const data = await res.json();

      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
        setBriefingDone(true);
      } else {
        // No history — trigger auto-briefing immediately
        await sendMessage(null, 'briefing');
      }
    }
    init();
  }, [candidateId]);

  async function sendMessage(
    userText: string | null,
    mode: 'briefing' | 'question' = 'question'
  ) {
    if (streaming) return;
    if (mode === 'question' && !userText?.trim()) return;

    // Add user message to UI immediately (optimistic)
    if (userText) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: userText, ts: new Date().toISOString() },
      ]);
    }
    setInput('');
    setStreaming(true);
    setStreamingContent('');

    const res = await fetch(`/api/candidates/${candidateId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, mode }),
    });

    if (!res.ok || !res.body) {
      setStreaming(false);
      return;
    }

    // Read SSE stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.replace('data: ', '').trim();
        if (payload === '[DONE]') break;

        try {
          const { delta } = JSON.parse(payload);
          accumulated += delta;
          setStreamingContent(accumulated);
        } catch { /* ignore malformed chunks */ }
      }
    }

    // Commit streamed content as a real message
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: accumulated, ts: new Date().toISOString() },
    ]);
    setStreamingContent('');
    setStreaming(false);
    setBriefingDone(true);
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, 'question');
    }
  };

  return (
    <div className="flex flex-col h-full border-l border-border bg-background">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <p className="text-sm font-medium text-foreground">AI Assistant</p>
        <p className="text-xs text-muted-foreground">
          Briefing on {candidateName}
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages
          .filter((m) => m.role !== 'system')
          .map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

        {/* Streaming content — shown while AI is typing */}
        {streaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground whitespace-pre-wrap leading-relaxed">
              {streamingContent}
              <span className="inline-block w-1 h-3 ml-0.5 bg-foreground animate-pulse" />
            </div>
          </div>
        )}

        {/* Loading state before first token arrives */}
        {streaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground animate-pulse">
              Analysing candidate…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input — only shown after briefing is complete */}
      {briefingDone && (
        <div className="px-4 py-3 border-t border-border shrink-0">
          <div className="flex gap-2">
            <textarea
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2
                         text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1
                         focus:ring-ring min-h-[40px] max-h-[120px]"
              placeholder="Ask anything about this candidate…"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input, 'question')}
              disabled={streaming || !input.trim()}
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground
                         disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
