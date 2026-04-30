import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { getDefaultAiModel, type AIModelId } from "@/lib/models";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  messages: Message[];
  onSendMessage: (message: string, model: AIModelId) => Promise<void>;
  isLoading?: boolean;
}

export default function AIChat({
  messages,
  onSendMessage,
  isLoading = false,
}: AIChatProps) {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    setIsSending(true);
    try {
      await onSendMessage(input.trim(), getDefaultAiModel());
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="p-3 sm:p-4 border-b border-orange-900/30 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <h3 className="font-bold text-sm sm:text-base text-white">AI Assistant</h3>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">
              Modify your app with natural language
            </p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3 sm:p-4">
        <div ref={scrollRef} className="space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-4 sm:mt-8">
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-600/50" />
              <p className="mb-3 sm:mb-4 font-medium text-sm sm:text-base text-white uppercase tracking-tighter">Quick Actions</p>
              <div className="grid grid-cols-1 gap-2">
                {[
                  "Make the background blue",
                  "Add a button to clear all items",
                  "Change the font to something modern",
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left p-2.5 bg-zinc-900 border border-orange-900/30 rounded-none text-slate-300 hover:bg-zinc-800 hover:border-orange-500/50 hover:text-white transition-all text-[11px] sm:text-xs font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[95%] sm:max-w-[85%] rounded-none px-3 sm:px-4 py-2 border-2 ${
                  message.role === "user"
                    ? "bg-orange-600 text-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-zinc-900 border-orange-900/30 text-slate-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border-2 border-orange-900/30 rounded-none px-3 sm:px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-orange-500" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-orange-900/30 space-y-3">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe changes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[80px] sm:min-h-[100px] max-h-[150px] sm:max-h-[200px] resize-none text-sm sm:text-base bg-zinc-900 border-2 border-orange-900/50 text-white placeholder:text-slate-500 focus:border-orange-500 rounded-none shadow-[inset_2px_2px_4px_rgba(0,0,0,0.5)]"
            disabled={isSending || isLoading}
            aria-label="Chat input"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending || isLoading}
            className="shrink-0 min-w-[48px] h-full sm:min-h-[48px] bg-orange-600 hover:bg-orange-700 text-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2 font-mono uppercase">
          Enter: Send / Shift+Enter: New Line
        </p>
      </form>
    </div>
  );
}
