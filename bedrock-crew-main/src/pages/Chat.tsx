import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";
import {
  Send, Loader2, Bot, User, Sparkles, Trash2,
  ChevronDown, ChevronRight, Terminal, CheckCircle2, XCircle,
  AlertCircle, Key
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatMessage, ToolCall } from "@/types/agent";
import { AGENT_TOOLS, executeTool } from "@/lib/orchestrator";

const MODELS = [
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
  { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B" },
  { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

const SYSTEM_PROMPT = `You are an AI orchestrator that can create, run, and manage AI agents. You have access to tools to:
- Create agents with specific roles and models
- Run agents on tasks
- List existing agents
- Delete agents
- Run multi-agent pipelines (chaining agents in sequence)

When a user asks you to do something that involves agents, use the appropriate tools. 
After tool calls complete, summarize what happened clearly.
Be proactive: if a user describes a complex task, suggest creating a pipeline of agents.
Format responses with markdown when helpful.`;

function ToolCallBadge({ tc }: { tc: ToolCall }) {
  const [open, setOpen] = useState(false);
  const icon =
    tc.status === "done" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> :
    tc.status === "error" ? <XCircle className="h-3.5 w-3.5 text-red-400" /> :
    tc.status === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> :
    <AlertCircle className="h-3.5 w-3.5 text-black/30" />;

  return (
    <div className="rounded-lg border border-black/8 bg-black/2 overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 hover:bg-black/4 transition-colors text-left"
      >
        <Terminal className="h-3.5 w-3.5 text-primary/60 shrink-0" />
        <span className="font-mono font-semibold text-black/70 flex-1">{tc.name}</span>
        {icon}
        {open ? <ChevronDown className="h-3 w-3 text-black/30" /> : <ChevronRight className="h-3 w-3 text-black/30" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-black/6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/30 mt-2 mb-1">Input</p>
            <pre className="bg-black/4 rounded p-2 text-[11px] font-mono text-black/60 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(tc.arguments, null, 2)}
            </pre>
          </div>
          {tc.result && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/30 mb-1">Output</p>
              <pre className="bg-black/4 rounded p-2 text-[11px] font-mono text-black/60 overflow-x-auto whitespace-pre-wrap max-h-48">
                {tc.result.length > 800 ? tc.result.slice(0, 800) + "\n…(truncated)" : tc.result}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={cn("max-w-[80%] space-y-2", isUser ? "items-end" : "items-start")}>
        {msg.content && (
          <div className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-white rounded-br-sm shadow-sm"
              : "bg-[#f5f5f5] text-black rounded-bl-sm"
          )}>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        )}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="space-y-1.5 w-full min-w-[280px]">
            {msg.toolCalls.map((tc) => (
              <ToolCallBadge key={tc.id} tc={tc} />
            ))}
          </div>
        )}
        <p className="text-[10px] text-black/25 px-1">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-black/8 flex items-center justify-center shrink-0 mt-0.5">
          <User className="h-4 w-4 text-black/50" />
        </div>
      )}
    </div>
  );
}

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("groq_api_key") ?? "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const onAgentsChange = useCallback(() => {
    // Trigger any agent-dependent UI to refresh (agents page polls independently)
  }, []);

  const addMessage = (msg: Omit<ChatMessage, "id" | "timestamp">): ChatMessage => {
    const full: ChatMessage = { ...msg, id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, full]);
    return full;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!apiKey) {
      setShowKeyInput(true);
      return;
    }

    setInput("");
    setLoading(true);

    addMessage({ role: "user", content: text });

    // Build history for API
    const history = messages.map((m) => ({
      role: m.role === "tool" ? "tool" : m.role,
      content: m.content,
      ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
    })) as Array<{ role: string; content: string; tool_call_id?: string }>;

    try {
      await runConversationTurn([...history, { role: "user", content: text }]);
    } finally {
      setLoading(false);
    }
  };

  const runConversationTurn = async (history: Array<{ role: string; content: string; tool_call_id?: string }>) => {
    // Stream from backend
    const resp = await fetch(`${apiUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history],
        api_key: apiKey,
        model: selectedModel,
        tools: AGENT_TOOLS,
      }),
    });

    if (!resp.ok || !resp.body) {
      const errText = await resp.text().catch(() => "");
      addMessage({ role: "assistant", content: `Error: ${errText || resp.statusText}` });
      return;
    }

    // Read SSE stream
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantContent = "";
    let pendingToolCalls: Array<{ index: number; id: string; name: string; argsRaw: string }> = [];
    let assistantMsgId = "";

    // Create placeholder assistant message
    const placeholder = addMessage({ role: "assistant", content: "" });
    assistantMsgId = placeholder.id;

    try {
      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break outer;

          try {
            const parsed = JSON.parse(json);
            if (parsed.error) throw new Error(parsed.error);

            const delta = parsed.choices?.[0]?.delta;
            if (!delta) continue;

            // Text content
            if (delta.content) {
              assistantContent += delta.content;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantMsgId ? { ...m, content: assistantContent } : m)
              );
            }

            // Tool call deltas
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!pendingToolCalls[idx]) {
                  pendingToolCalls[idx] = { index: idx, id: tc.id ?? `tc_${idx}`, name: tc.function?.name ?? "", argsRaw: "" };
                }
                if (tc.function?.name) pendingToolCalls[idx].name = tc.function.name;
                if (tc.function?.arguments) pendingToolCalls[idx].argsRaw += tc.function.arguments;
              }
            }
          } catch { /* skip parse errors */ }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // If there are tool calls, execute them
    if (pendingToolCalls.length > 0) {
      const toolCalls: ToolCall[] = pendingToolCalls.map((tc) => {
        let parsedArgs: Record<string, unknown> = {};
        try { parsedArgs = JSON.parse(tc.argsRaw); } catch { /* keep empty */ }
        return { id: tc.id, name: tc.name, arguments: parsedArgs, status: "pending" as const };
      });

      // Update assistant message with tool calls
      setMessages((prev) =>
        prev.map((m) => m.id === assistantMsgId ? { ...m, toolCalls } : m)
      );

      const toolResults: Array<{ role: string; content: string; tool_call_id: string }> = [];

      for (const tc of toolCalls) {
        // Mark as running
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, toolCalls: m.toolCalls?.map((t) => t.id === tc.id ? { ...t, status: "running" as const } : t) }
              : m
          )
        );

        let result = "";
        try {
          result = await executeTool(tc, apiKey, apiUrl, onAgentsChange);
          // Mark done
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, toolCalls: m.toolCalls?.map((t) => t.id === tc.id ? { ...t, status: "done" as const, result } : t) }
                : m
            )
          );
        } catch (err) {
          result = JSON.stringify({ error: err instanceof Error ? err.message : String(err) });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, toolCalls: m.toolCalls?.map((t) => t.id === tc.id ? { ...t, status: "error" as const, result } : t) }
                : m
            )
          );
        }

        toolResults.push({ role: "tool", content: result, tool_call_id: tc.id });
      }

      // Continue conversation with tool results
      const nextHistory = [
        ...history,
        { role: "assistant", content: assistantContent },
        ...toolResults,
      ];
      await runConversationTurn(nextHistory);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    if (k) {
      sessionStorage.setItem("groq_api_key", k);
      setApiKey(k);
      setShowKeyInput(false);
      setKeyDraft("");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mt-6 -mx-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-black/8 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-black">AI Orchestrator</h2>
            <p className="text-[10px] text-black/40">Chat · Create · Run · Manage Agents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="h-8 text-xs border-black/12 w-44 focus:ring-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 px-2 text-xs", apiKey ? "text-green-600 hover:text-green-700" : "text-black/40 hover:text-primary")}
            onClick={() => setShowKeyInput((v) => !v)}
          >
            <Key className="h-3.5 w-3.5 mr-1" />
            {apiKey ? "Key set" : "Set key"}
          </Button>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-black/40 hover:text-red-500"
              onClick={() => setMessages([])}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* API Key input */}
      {showKeyInput && (
        <div className="px-6 py-3 border-b border-black/8 bg-primary/3 flex items-center gap-3 shrink-0">
          <Key className="h-4 w-4 text-primary shrink-0" />
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveKey()}
            placeholder="Enter your Groq API key (gsk_...)"
            className="flex-1 text-sm bg-transparent border-0 outline-none text-black placeholder:text-black/30"
            autoFocus
          />
          <Button size="sm" className="h-7 text-xs bg-primary text-white hover:bg-primary/90" onClick={saveKey}>
            Save
          </Button>
          <button onClick={() => setShowKeyInput(false)} className="text-black/30 hover:text-black">✕</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-fade-in">
            <div className="p-4 rounded-2xl bg-primary/8">
              <Bot className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-black">AI Agent Orchestrator</h3>
              <p className="text-sm text-black/45 mt-1 max-w-sm">
                Chat with the AI to create, run, and manage agents. Try asking it to build a research pipeline.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 max-w-lg w-full">
              {[
                "Create a researcher agent and run it on 'latest AI trends'",
                "Build a 3-agent pipeline: planner → coder → reviewer",
                "List all my agents and their status",
                "Create a summarizer agent using Mixtral",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-black/8 hover:border-primary/40 hover:bg-primary/3 transition-all text-black/60 hover:text-black"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {loading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-[#f5f5f5] rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                {[0, 1, 2].map((n) => (
                  <span key={n} className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-typing-dot" style={{ animationDelay: `${n * 0.2}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-black/8 bg-white shrink-0">
        <div className={cn(
          "rounded-2xl border bg-white transition-all duration-200",
          "border-black/10 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_hsl(24_100%_50%/0.10)]"
        )}>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={apiKey ? "Ask the AI to create agents, run pipelines, or just chat…" : "Set your Groq API key first →"}
            className="min-h-[52px] max-h-[160px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-black placeholder:text-black/30 leading-relaxed py-3.5 px-4 rounded-2xl"
            rows={1}
            disabled={loading}
          />
          <div className="flex items-center justify-between px-3 pb-3">
            <p className="text-[10px] text-black/25">Enter to send · Shift+Enter for new line</p>
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={cn(
                "h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-150",
                input.trim() && !loading
                  ? "bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95"
                  : "bg-black/6 text-black/25 cursor-not-allowed"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
