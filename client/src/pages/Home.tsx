import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Code2, Zap, Github, Twitter, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [, navigate] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      setGeneratedApp(data);
      setShowEditor(true);
      setChatMessages([
        {
          role: "assistant",
          content: `I've generated your app based on your description. You can now see the code on the left and a live preview on the right. Feel free to ask me to modify anything!`,
        },
      ]);
    },
    onError: (error) => {
      setIsGenerating(false);
      alert(`Error generating app: ${error.message}`);
    },
  });

  const modifyMutation = trpc.apps.modify.useMutation({
    onSuccess: (data) => {
      setIsModifying(false);
      setGeneratedApp((prev: any) => ({
        ...prev,
        ...data,
      }));
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Done! I've updated your app. Check the preview on the right.",
        },
      ]);
    },
    onError: (error) => {
      setIsModifying(false);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please describe your app");
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate({ prompt: prompt.trim() });
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || !generatedApp) return;

    const userMessage = chatInput;
    const newMessages = [
      ...chatMessages,
      { role: "user", content: userMessage },
    ];
    setChatMessages(newMessages);
    setChatInput("");
    setIsModifying(true);

    const currentCode = `${generatedApp.htmlCode}\n\n<style>\n${generatedApp.cssCode}\n</style>\n\n<script>\n${generatedApp.jsCode}\n</script>`;
    modifyMutation.mutate({
      appId: generatedApp.id || 0,
      instruction: userMessage,
      currentCode,
    });
  };



  if (showEditor && generatedApp) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setShowEditor(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 sm:p-2"
            >
              ← Back
            </button>
            <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{generatedApp.title}</h2>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                const code = `<!-- HTML -->\n${generatedApp.htmlCode}\n\n<!-- CSS -->\n<style>\n${generatedApp.cssCode}\n</style>\n\n<!-- JavaScript -->\n<script>\n${generatedApp.jsCode}\n</script>`;
                navigator.clipboard.writeText(code);
              }}
            >
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => {
                const htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp.title}</title>\n  <style>\n    ${generatedApp.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp.htmlCode || ""}\n  <script>\n    ${generatedApp.jsCode || ""}\n  </script>\n</body>\n</html>`;
                const blob = new Blob([htmlContent], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${generatedApp.title.replace(/\s+/g, "-").toLowerCase()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </Button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden gap-0">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-border overflow-hidden min-h-0">
            <div className="flex items-center gap-2 px-4 py-2 sm:py-3 border-b border-border bg-card/50">
              <Code2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Generated Code</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <Editor
                defaultLanguage="html"
                value={`${generatedApp.htmlCode}\n\n<style>\n${generatedApp.cssCode}\n</style>\n\n<script>\n${generatedApp.jsCode}\n</script>`}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "Monaco, Menlo, Ubuntu Mono",
                  readOnly: true,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="flex-1 flex flex-col border-l border-border overflow-hidden min-h-0">
            <div className="flex items-center gap-2 px-4 py-2 sm:py-3 border-b border-border bg-card/50">
              <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Live Preview</span>
            </div>
            <div className="flex-1 overflow-hidden bg-white">
              <iframe
                srcDoc={`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp.title}</title>\n  <style>\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    }\n    ${generatedApp.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp.htmlCode || ""}\n  <script>\n    ${generatedApp.jsCode || ""}\n  </script>\n</body>\n</html>`}
                className="w-full h-full border-none"
                title="App Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="border-t border-border bg-card/50 backdrop-blur">
          <div className="max-w-full mx-auto flex flex-col h-48 sm:h-40">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 sm:space-y-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-card text-card-foreground border border-border"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border px-4 py-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isModifying) {
                    handleChatSend();
                  }
                }}
                placeholder="Ask AI to modify..."
                disabled={isModifying}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition disabled:opacity-50"
              />
              <Button
                onClick={handleChatSend}
                disabled={!chatInput.trim() || isModifying}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                {isModifying ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="text-base sm:text-lg font-bold text-foreground">No-Code AI Builder</span>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/pricing")}
          className="py-2 sm:py-3 font-semibold rounded-lg"
        >
          View Pricing
        </Button>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
              What would you like to build?
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Describe your app idea and press Enter to generate it instantly
            </p>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., A todo list app with add, delete, and mark complete functionality. Use a clean modern design with gradient background..."
                className="min-h-32 sm:min-h-40 bg-card border border-border rounded-lg px-4 py-3 pr-32 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition resize-none text-sm sm:text-base"
                disabled={isGenerating}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="absolute bottom-3 right-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white border-0 py-2 px-4 font-semibold rounded-lg transition-all"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
