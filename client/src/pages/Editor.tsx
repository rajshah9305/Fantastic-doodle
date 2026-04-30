import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import AIChat from "@/components/AIChat";
import { Download, Save, ArrowLeft, Loader2, Code, Eye, Sparkles } from "lucide-react";
import { buildHtmlDocument } from "@/lib/app-code";
import type { AIModelId } from "@/lib/models";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ActiveTab = "code" | "preview" | "ai";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  const appId = parseInt(id || "0", 10);

  // Fetch app data
  const { data: app, isLoading } = trpc.apps.get.useQuery(
    { id: appId },
    { enabled: appId > 0 }
  );

  // Update app mutation
  const updateApp = trpc.apps.update.useMutation({
    onSuccess: () => {
      toast.success("App saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Modify app with AI
  const modifyApp = trpc.apps.modify.useMutation({
    onSuccess: (data: any) => {
      const fullCode = buildHtmlDocument({
        title: data.title || app?.title || "Generated App",
        htmlCode: data.htmlCode,
        cssCode: data.cssCode,
        jsCode: data.jsCode,
      });
      setCode(fullCode);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "App updated successfully! Check the preview to see the changes.",
        },
      ]);
      // Switch to preview tab to show changes
      setActiveTab("preview");
    },
    onError: (error: any) => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't update the app: ${error.message}`,
        },
      ]);
    },
  });

  useEffect(() => {
    if (app) {
      const fullCode = buildHtmlDocument(app);
      setCode(fullCode);
    }
  }, [app]);

  const handleSave = () => {
    if (!app) return;
    // Extract CSS and JS from the full code to keep DB fields in sync
    const cssMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const jsMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const bodyMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    // Strip style and script tags from body to get clean HTML
    const htmlOnly = bodyMatch
      ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").trim()
      : code;
    updateApp.mutate({
      id: appId,
      htmlCode: htmlOnly,
      cssCode: cssMatch ? cssMatch[1].trim() : app.cssCode ?? "",
      jsCode: jsMatch ? jsMatch[1].trim() : app.jsCode ?? "",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app?.title || "app"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("App exported successfully");
  };

  const handleAIChat = async (message: string, model: AIModelId) => {
    setChatMessages((prev) => [...prev, { role: "user", content: message }]);
    try {
      await modifyApp.mutateAsync({
        id: appId,
        instruction: message,
        model: model,
      });
    } catch {
      // The mutation onError handler adds assistant feedback.
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-orange-400 font-mono text-sm sm:text-base uppercase tracking-tighter">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="h-screen flex items-center justify-center bg-black px-4">
        <div className="text-center border-4 border-orange-600 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] max-w-md w-full bg-zinc-950">
          <p className="text-white mb-6 font-mono text-lg sm:text-xl font-black uppercase tracking-tighter">404: Construction Not Found</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center px-4 py-3 min-h-[44px] transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono font-black text-xs sm:text-sm uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-slate-300 overflow-hidden font-sans relative">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Header */}
      <header className="h-16 sm:h-20 border-b-4 border-black bg-zinc-950 flex items-center justify-between px-3 xs:px-4 md:px-6 z-20 relative shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <button
            onClick={() => navigate("/dashboard")}
            className="shrink-0 group"
            title="Back to dashboard"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center text-white font-black text-lg sm:text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
              R
            </div>
          </button>
          <div className="hidden sm:block h-8 w-1 bg-zinc-800"></div>
          <div className="min-w-0">
            <h2 className="text-[9px] sm:text-xs font-black text-orange-600 tracking-[0.2em] uppercase leading-none mb-1">
              Studio
            </h2>
            <p className="text-xs sm:text-lg font-bold text-white truncate max-w-[100px] xs:max-w-[150px] sm:max-w-md uppercase tracking-tight">
              {app.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <button
            onClick={handleSave}
            disabled={updateApp.isPending}
            className="min-h-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all bg-zinc-900 text-white border-2 border-black hover:bg-zinc-800 disabled:opacity-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 sm:gap-2"
          >
            {updateApp.isPending ? (
              <Loader2 size={12} className="animate-spin sm:w-3.5 sm:h-3.5" />
            ) : (
              <Save size={12} className="sm:w-3.5 sm:h-3.5" />
            )}
            <span className="hidden xs:inline">Save</span>
          </button>

          <button
            onClick={handleDownload}
            className="min-h-[44px] px-2.5 sm:px-4 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all bg-orange-600 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center gap-1.5 sm:gap-2"
          >
            <Download size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Export</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Tab Navigation - visible on mobile */}
        <div className="md:hidden h-14 bg-zinc-900 border-b-2 border-black flex items-center justify-around px-1 shrink-0">
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
              activeTab === "ai" ? "text-orange-500 bg-black/20" : "text-slate-500"
            }`}
          >
            <Sparkles size={18} />
            <span className="text-[9px] font-black uppercase mt-1">AI Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
              activeTab === "code" ? "text-orange-500 bg-black/20" : "text-slate-500"
            }`}
          >
            <Code size={18} />
            <span className="text-[9px] font-black uppercase mt-1">Code</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex flex-col items-center justify-center py-1 transition-all min-h-[48px] ${
              activeTab === "preview" ? "text-orange-500 bg-black/20" : "text-slate-500"
            }`}
          >
            <Eye size={18} />
            <span className="text-[9px] font-black uppercase mt-1">Preview</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Code Panel - always visible on desktop, tab on mobile */}
          <div
            className={`flex-col w-full md:w-1/2 border-r-4 border-black bg-zinc-950 ${
              activeTab === "code" ? "flex flex-1" : "hidden md:flex"
            }`}
          >
            <div className="h-9 sm:h-10 bg-black border-b-2 border-zinc-800 flex items-center px-4 justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code size={12} className="text-orange-600 sm:w-3.5 sm:h-3.5" />
                <span className="text-[10px] sm:text-xs font-mono font-black text-orange-400 tracking-tighter uppercase leading-none">
                  Source
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <CodeEditor value={code} onChange={setCode} language="html" />
            </div>
          </div>

          {/* Right Panel (AI or Preview) */}
          <div
            className={`flex-1 bg-zinc-900 relative flex flex-col ${
              activeTab === "code" ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Desktop toggle tabs */}
            <div className="hidden md:flex h-10 bg-black border-b-2 border-zinc-800 items-center px-2 gap-1 shrink-0">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-1 text-[10px] font-mono font-black uppercase transition-all flex items-center gap-2 min-h-[32px] ${
                  activeTab === "preview"
                    ? "text-white bg-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Eye size={12} />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-1 text-[10px] font-mono font-black uppercase transition-all flex items-center gap-2 min-h-[32px] ${
                  activeTab === "ai"
                    ? "text-white bg-orange-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sparkles size={12} />
                AI Assistant
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {/* Preview Content */}
              <div className={`flex-1 overflow-hidden ${activeTab === "preview" ? "flex" : "hidden"}`}>
                <LivePreview code={code} title={app.title} />
              </div>

              {/* AI Chat Content */}
              <div className={`flex-1 overflow-hidden ${activeTab === "ai" ? "block" : "hidden"}`}>
                <AIChat
                  messages={chatMessages}
                  onSendMessage={handleAIChat}
                  isLoading={modifyApp.isPending}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
