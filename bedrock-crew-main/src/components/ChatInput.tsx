import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, X, MessageSquare, Sparkles, Settings2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: string;
  content: string;
}

interface Model {
  id: string;
  name: string;
}

interface ChatInputProps {
  onSubmit: (message: string, modelId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  messages?: ChatMessage[];
  models?: Model[];
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

const ChatInput = ({
  onSubmit,
  loading = false,
  disabled = false,
  messages = [],
  models = [],
  selectedModel = "llama-3.3-70b-versatile",
  onModelChange
}: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !loading && !disabled) {
      onSubmit(input.trim(), selectedModel);
      setInput("");
      setExpanded(true);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = input.trim().length > 0 && !loading && !disabled;

  return (
    <div className="w-full px-4 pb-6 pt-2">
      <div className="max-w-3xl mx-auto">
        {/* Conversation panel */}
        {expanded && messages.length > 0 && (
          <div className="mb-3 rounded-2xl bg-white border border-black/8 shadow-elevated overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/6 bg-[#fafafa]">
              <div className="flex items-center gap-2 text-xs font-semibold text-black/50">
                <MessageSquare className="h-3 w-3" />
                Conversation · {messages.length} messages
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-black/6 transition-colors text-black/40 hover:text-black/70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5 animate-fade-in",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: "backwards" }}
                >
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-xl px-3.5 py-2 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-white rounded-br-sm shadow-sm"
                        : "bg-[#f5f5f5] text-black rounded-bl-sm"
                    )}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-6 h-6 rounded-lg bg-[#f0f0f0] flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5 text-black/50" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 animate-fade-in">
                  <div className="w-6 h-6 rounded-lg bg-gradient-hero flex items-center justify-center shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-[#f5f5f5] rounded-xl px-4 py-3 rounded-bl-sm">
                    <div className="flex gap-1 items-center">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-typing-dot"
                          style={{ animationDelay: `${n * 0.2}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Main input card */}
        <div
          className={cn(
            "rounded-2xl bg-white border transition-all duration-200 chat-float",
            focused
              ? "border-primary/50 shadow-[0_0_0_3px_hsl(24_100%_50%/0.12),0_-4px_32px_-4px_hsl(0_0%_0%/0.08)]"
              : "border-black/10"
          )}
        >
          {/* Hint bar */}
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary/80">
              <Sparkles className="h-3 w-3" />
              AI Assistant
            </div>

            <div className="ml-auto flex items-center gap-3">
              {models.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Settings2 className="h-3 w-3 text-black/30" />
                  <Select value={selectedModel} onValueChange={onModelChange}>
                    <SelectTrigger className="h-6 border-0 bg-transparent p-0 text-[11px] font-medium text-black/40 hover:text-primary transition-colors focus:ring-0 shadow-none gap-1">
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent align="end" className="bg-white border-black/8 shadow-elevated">
                      {models.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-xs">
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {messages.length > 0 && !expanded && (
                <button
                  onClick={() => setExpanded(true)}
                  className="text-[11px] text-black/40 hover:text-primary transition-colors font-medium"
                >
                  {messages.length} message{messages.length !== 1 ? "s" : ""} · show
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2 px-3 pb-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setFocused(true);
                if (messages.length > 0) setExpanded(true);
              }}
              onBlur={() => setFocused(false)}
              placeholder="Ask anything… (Shift+Enter for new line)"
              className="flex-1 min-h-[44px] max-h-[140px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm text-black placeholder:text-black/30 leading-relaxed py-2.5 px-1"
              rows={1}
              disabled={disabled || loading}
            />
            <button
              type="submit"
              disabled={!canSend}
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-150",
                canSend
                  ? "bg-primary text-white shadow-sm shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95"
                  : "bg-black/6 text-black/25 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-black/25 mt-2 font-medium">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
