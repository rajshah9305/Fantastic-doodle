import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<void>;
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
      await onSendMessage(input.trim());
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
      <div className="p-3 sm:p-4 border-b border-orange-900/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
          <h3 className="font-bold text-sm sm:text-base text-white">AI Assistant</h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Modify your app with natural language
        </p>
      </div>

      <ScrollArea className="flex-1 p-3 sm:p-4">
        <div ref={scrollRef} className="space-y-3 sm:space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-slate-400 mt-4 sm:mt-8">
              <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-orange-600/50" />
              <p className="mb-3 sm:mb-4 font-medium text-sm sm:text-base text-white">Try asking:</p>
              <ul className="text-xs sm:text-sm space-y-1.5 sm:space-y-2">
                <li className="p-2 bg-zinc-900 border border-orange-900/30 rounded-lg text-slate-300">
                  "Make the background blue"
                </li>
                <li className="p-2 bg-zinc-900 border border-orange-900/30 rounded-lg text-slate-300">
                  "Add a button to clear all items"
                </li>
                <li className="p-2 bg-zinc-900 border border-orange-900/30 rounded-lg text-slate-300">
                  "Change the font to something modern"
                </li>
                <li className="p-2 bg-zinc-900 border border-orange-900/30 rounded-lg text-slate-300 hidden sm:block">
                  "Add dark mode support"
                </li>
              </ul>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] rounded-lg px-3 sm:px-4 py-2 ${
                  message.role === "user"
                    ? "bg-orange-600 text-white"
                    : "bg-zinc-900 border border-orange-900/30 text-slate-300"
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-zinc-900 border border-orange-900/30 rounded-lg px-3 sm:px-4 py-2">
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-orange-500" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-orange-900/30">
        <div className="flex gap-2">
          <Textarea
            placeholder="Describe the changes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[60px] sm:min-h-[80px] max-h-[150px] sm:max-h-[200px] resize-none text-sm sm:text-base bg-zinc-900 border-orange-900/50 text-white placeholder:text-slate-500 focus:border-orange-500"
            disabled={isSending || isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isSending || isLoading}
            className="shrink-0 min-w-[44px] min-h-[44px] bg-orange-600 hover:bg-orange-700 text-white"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-1.5 sm:mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
