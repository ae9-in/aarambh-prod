"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type TrainingAIChatProps = {
  categoryId?: string | null;
  categoryName?: string | null;
};

const GREETING =
  "Hi! I am Arambh AI. Ask me anything from your training materials and I will answer with practical, step-by-step guidance.";

export function TrainingAIChat({ categoryId = null, categoryName = null }: TrainingAIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const title = useMemo(() => {
    if (!categoryId) return "General AI Training Chat";
    return `${categoryName || "Category"} AI Training Chat`;
  }, [categoryId, categoryName]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || !user?.id || !user?.orgId || isLoading) return;

    setInput("");
    setIsLoading(true);
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
    };
    const assistantId = `a-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userId: user.id,
          orgId: user.orgId,
          userRole: user.role,
          sessionId,
          categoryId,
        }),
      });

      if (!res.ok || !res.body) {
        let message = "AI chat request failed";
        try {
          const body = await res.json();
          if (body?.error) message = String(body.error);
        } catch {
          // ignore parse failure
        }
        throw new Error(message);
      }

      const nextSessionId = res.headers.get("x-chat-session-id");
      if (nextSessionId) setSessionId(nextSessionId);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulated = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        const chunk = decoder.decode(value || new Uint8Array(), { stream: !done });
        if (!chunk) continue;
        accumulated += chunk;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: accumulated } : m)),
        );
      }

      if (!accumulated.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "This topic is not covered in your current training materials." }
              : m,
          ),
        );
      }
    } catch (err) {
      console.error("AI chat error:", err);
      const errMsg =
        err instanceof Error && err.message ? err.message : "Could not get AI response.";
      toast.error(errMsg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: `I could not process that right now. ${errMsg}`,
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col bg-[#FAF9F7] px-4 py-6 text-[#1C1917]">
      <div className="mb-5 rounded-2xl border border-[#E7E5E4] bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E85520] text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-xs text-[#78716C]">
              Answers are grounded in uploaded Arambh training materials only.
            </p>
          </div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-[#E7E5E4] bg-[#F7F5F2] p-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "border border-[#E7E5E4] bg-white text-[#1C1917]"
                  : "border border-[#FFD9C7] bg-[#FFF2EA] text-[#1C1917]"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-1 prose-headings:my-2 prose-headings:font-semibold">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || (isLoading ? "Thinking..." : "")}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={sendMessage}
        className="mt-4 rounded-2xl border border-[#E7E5E4] bg-white p-3 shadow-sm"
      >
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ask Arambh AI a question..."
            className="min-h-[56px] flex-1 resize-none rounded-xl border border-[#E7E5E4] px-3 py-2 text-sm outline-none focus:border-[#FF6B35]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B35] text-white transition hover:bg-[#E85520] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
