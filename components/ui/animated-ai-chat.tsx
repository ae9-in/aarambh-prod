"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AnimatedAIChatProps = {
  categoryId?: string | null;
  categoryName?: string | null;
};

const FALLBACK_GREETING =
  "Hi! I am Arambh AI. Ask me anything from your training materials and I will answer with practical, step-by-step guidance.";

export function AnimatedAIChat({ categoryId = null, categoryName = null }: AnimatedAIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: FALLBACK_GREETING },
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
        throw new Error("AI chat request failed");
      }

      const nextSessionId = res.headers.get("x-chat-session-id");
      if (nextSessionId) {
        setSessionId(nextSessionId);
      }

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
              ? {
                  ...m,
                  content:
                    "This topic is not covered in your current training materials.",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      console.error("AI chat error:", err);
      toast.error("Could not get AI response. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I could not process that right now. Please try again in a few seconds.",
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
              {msg.content || (isLoading && msg.role === "assistant" ? "Thinking..." : "")}
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
/*

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AnimatedAIChatProps = {
  categoryId?: string | null;
  categoryName?: string | null;
};

const FALLBACK_GREETING =
  "Hi! I am Arambh AI. Ask me anything from your training materials and I will answer with practical, step-by-step guidance.";

export function AnimatedAIChat({ categoryId = null, categoryName = null }: AnimatedAIChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: FALLBACK_GREETING },
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
        throw new Error("AI chat request failed");
      }

      const nextSessionId = res.headers.get("x-chat-session-id");
      if (nextSessionId) {
        setSessionId(nextSessionId);
      }

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
              ? {
                  ...m,
                  content:
                    "This topic is not covered in your current training materials.",
                }
              : m,
          ),
        );
      }
    } catch (err) {
      console.error("AI chat error:", err);
      toast.error("Could not get AI response. Please try again.");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "I could not process that right now. Please try again in a few seconds.",
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
                  ? "bg-white text-[#1C1917] border border-[#E7E5E4]"
                  : "bg-[#FFF2EA] text-[#1C1917] border border-[#FFD9C7]"
              }`}
            >
              {msg.content || (isLoading && msg.role === "assistant" ? "Thinking..." : "")}
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
"use client";

import * as React from "react";
import {
  ImageIcon,
  FileUp,
  Figma,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  PlusIcon,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// DESIGN SYSTEM — STRICT
// Background: #FAF9F7 (warm pearl white)
// Dark: #1C1917 (espresso)
// Primary: #FF6B35 (burnt orange)
// Deep: #E85520
// Gold: #C8A96E
// Success: #10B981
// NO purple, NO violet, NO indigo ANYWHERE

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(
          textarea.scrollHeight,
          maxHeight ?? Number.POSITIVE_INFINITY,
        ),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  React.useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  React.useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing
              ? "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              : "",
            className,
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* ring color uses burnt orange */}
        {showRing && isFocused && (
          <motion.span
            className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-0"
            style={{ boxShadow: "0 0 0 3px rgba(255,107,53,0.2)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export function AnimatedAIChat() {
  const [value, setValue] = React.useState("");
  const [attachments, setAttachments] = React.useState<string[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [activeSuggestion, setActiveSuggestion] = React.useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [recentCommand, setRecentCommand] = React.useState<string | null>(null);
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const [inputFocused, setInputFocused] = React.useState(false);
  const commandPaletteRef = React.useRef<HTMLDivElement>(null);

  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "Clone UI",
      description: "Generate a UI from a screenshot",
      prefix: "/clone",
    },
    {
      icon: <Figma className="h-4 w-4" />,
      label: "Import Figma",
      description: "Import a design from Figma",
      prefix: "/figma",
    },
    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: "Create Page",
      description: "Generate a new web page",
      prefix: "/page",
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: "Improve",
      description: "Improve existing UI design",
      prefix: "/improve",
    },
  ];

  React.useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);
      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value),
      );
      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");
      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1,
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);
          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue("");
          adjustHeight(true);
        }, 3000);
      });
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);
    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="lab-bg relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#FAF9F7] p-6 text-[#1C1917]">
      {/* soft orange / gold blobs */}
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <div
          className="absolute left-1/4 top-0 h-96 w-96 animate-pulse rounded-full blur-[128px]"
          style={{ background: "rgba(255,107,53,0.07)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 h-96 w-96 animate-pulse rounded-full blur-[128px]"
          style={{ background: "rgba(200,169,110,0.07)" }}
        />
        <div
          className="absolute right-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full blur-[96px]"
          style={{ background: "rgba(232,85,32,0.05)" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-2xl">
        <motion.div
          className="relative z-10 space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="space-y-3 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <h1
                className="pb-1 text-3xl font-medium tracking-tight"
                style={{
                  background:
                    "linear-gradient(135deg, #1C1917 0%, #FF6B35 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                How can I help today?
              </h1>
              <motion.div
                className="h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,107,53,0.3), transparent)",
                }}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p
              className="text-sm text-[#1C1917]/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Type a command or ask a question
            </motion.p>
          </div>

          <motion.div
            className="relative rounded-2xl bg-white shadow-lg"
            style={{ border: "1px solid #F0EDE8" }}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <AnimatePresence>
              {showCommandPalette && (
                <motion.div
                  ref={commandPaletteRef}
                  className="absolute bottom-full left-4 right-4 z-50 mb-2 overflow-hidden rounded-xl shadow-xl"
                  style={{
                    background: "#1C1917",
                    border: "1px solid rgba(255,107,53,0.2)",
                  }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="py-1">
                    {commandSuggestions.map((suggestion, index) => (
                      <motion.div
                        key={suggestion.prefix}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 px-3 py-2 text-xs transition-colors",
                          activeSuggestion === index
                            ? "text-white"
                            : "text-white/70 hover:bg-white/5",
                        )}
                        style={
                          activeSuggestion === index
                            ? { background: "rgba(255,107,53,0.15)" }
                            : {}
                        }
                        onClick={() => selectCommandSuggestion(index)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.03 }}
                      >
                        <div
                          className="flex h-5 w-5 items-center justify-center"
                          style={{ color: "#FF6B35" }}
                        >
                          {suggestion.icon}
                        </div>
                        <div className="font-medium text-white">
                          {suggestion.label}
                        </div>
                        <div className="ml-1 text-xs text-white/40">
                          {suggestion.prefix}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask Arambh AI a question..."
                containerClassName="w-full"
                className={cn(
                  "min-h-[60px] w-full resize-none border-none bg-transparent px-4 py-3 text-sm text-[#1C1917]",
                  "focus:outline-none placeholder:text-[#9CA3AF]",
                )}
                style={{ overflow: "hidden" }}
                showRing={false}
              />
            </div>

            <AnimatePresence>
              {attachments.length > 0 && (
                <motion.div
                  className="flex flex-wrap gap-2 px-4 pb-3"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {attachments.map((file, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-2 rounded-lg py-1.5 px-3 text-xs"
                      style={{
                        background: "#FAF9F7",
                        color: "rgba(28,25,23,0.7)",
                        border: "1px solid #F0EDE8",
                      }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <span>{file}</span>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="transition-colors"
                        style={{ color: "rgba(28,25,23,0.4)" }}
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div
              className="flex items-center justify-between gap-4 p-4"
              style={{ borderTop: "1px solid #F0EDE8" }}
            >
              <div className="flex items-center gap-3">
                <motion.button
                  type="button"
                  onClick={handleAttachFile}
                  whileTap={{ scale: 0.94 }}
                  className="group relative rounded-lg p-2 transition-colors"
                  style={{ color: "#9CA3AF" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FF6B35";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#9CA3AF";
                  }}
                >
                  <Paperclip className="h-4 w-4" />
                </motion.button>
                <motion.button
                  type="button"
                  data-command-button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCommandPalette((prev) => !prev);
                  }}
                  whileTap={{ scale: 0.94 }}
                  className="group relative rounded-lg p-2 transition-colors"
                  style={{
                    color: showCommandPalette ? "#FF6B35" : "#9CA3AF",
                    background: showCommandPalette
                      ? "rgba(255,107,53,0.08)"
                      : "transparent",
                  }}
                >
                  <Command className="h-4 w-4" />
                </motion.button>
              </div>

              <motion.button
                type="button"
                onClick={handleSendMessage}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isTyping || !value.trim()}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all"
                style={
                  value.trim()
                    ? {
                        background:
                          "linear-gradient(135deg, #FF6B35, #E85520)",
                        color: "white",
                        boxShadow: "0 4px 16px rgba(255,107,53,0.35)",
                      }
                    : {
                        background: "#F0EDE8",
                        color: "#9CA3AF",
                      }
                }
              >
                {isTyping || isPending ? (
                  <LoaderIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <SendIcon className="h-4 w-4" />
                )}
                <span>Send</span>
              </motion.button>
            </div>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {commandSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion.prefix}
                onClick={() => selectCommandSuggestion(index)}
                className="group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all"
                style={{
                  background: "#FAF9F7",
                  color: "rgba(28,25,23,0.6)",
                  border: "1px solid #F0EDE8",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#F0EDE8";
                  el.style.color = "#FF6B35";
                  el.style.borderColor = "rgba(255,107,53,0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "#FAF9F7";
                  el.style.color = "rgba(28,25,23,0.6)";
                  el.style.borderColor = "#F0EDE8";
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {suggestion.icon}
                <span>{suggestion.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isTyping && (
          <motion.div
            className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 shadow-lg"
            style={{
              background: "white",
              border: "1px solid #F0EDE8",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-7 w-8 items-center justify-center rounded-full text-center"
                style={{
                  background: "linear-gradient(135deg, #FF6B35, #E85520)",
                }}
              >
                <span className="mb-0.5 text-xs font-bold text-white">AI</span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: "rgba(28,25,23,0.7)" }}
              >
                <span>Thinking</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {inputFocused && (
        <motion.div
          className="pointer-events-none fixed z-0 h-[50rem] w-[50rem] rounded-full blur-[96px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,53,0.04), rgba(200,169,110,0.03), transparent)",
            opacity: 0.6,
          }}
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            mass: 0.5,
          }}
        />
      )}
    </div>
  );
}

function TypingDots() {
  return (
    <div className="ml-1 flex items-center">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="mx-0.5 h-1.5 w-1.5 rounded-full"
          style={{
            background: "#FF6B35",
            boxShadow: "0 0 6px rgba(255,107,53,0.4)",
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
*/

