import {
  Loader2,
  Copy,
  Code2,
  Smartphone,
  Monitor,
  Wand2,
  Save,
  CheckCircle2,
  Eye,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import Editor from "@monaco-editor/react";
import { getOrCreateSessionId } from "@/const";
import { toast } from "sonner";
import { useTypewriter } from "@/hooks/useTypewriter";
import { buildCodeBundle, buildHtmlDocument } from "@/lib/app-code";
import { getDefaultAiModel } from "@/lib/models";

interface GeneratedAppResponse {
  success: boolean;
  sessionId: string;
  title: string;
  htmlCode: string;
  cssCode: string | null;
  jsCode: string | null;
}

type WorkspaceTab = "code" | "preview";

export default function Home() {
  const [, navigate] = useLocation();
  const urlPrompt = new URLSearchParams(window.location.search).get("prompt") || "";
  const [prompt, setPrompt] = useState(urlPrompt);
  const [generatedApp, setGeneratedApp] = useState<GeneratedAppResponse | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("preview");

  useEffect(() => {
    if (urlPrompt) {
      const url = new URL(window.location.href);
      url.searchParams.delete("prompt");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      if (data && data.htmlCode) {
        setGeneratedApp(data);
        setShowEditor(true);
        setActiveTab("preview");
        toast.success("App generated successfully!");
      } else {
        toast.error("Invalid response from server");
      }
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.data?.message ||
        "An unexpected error occurred";
      toast.error(`Failed to generate app: ${message}`);
    },
  });

  const isGenerating = generateMutation.isPending;

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please describe your app");
      return;
    }
    const sessionId = getOrCreateSessionId();
    generateMutation.mutate({ prompt: prompt.trim(), sessionId, model: getDefaultAiModel() });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const fullCode = generatedApp ? buildCodeBundle(generatedApp) : "";
  const displayedCode = useTypewriter(fullCode, 10);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullCode);
    toast.success("Code copied to clipboard!");
  };

  const handleDownload = () => {
    if (!generatedApp) return;
    try {
      const htmlContent = buildHtmlDocument(generatedApp);
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${generatedApp.title.replace(/\s+/g, "-").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${generatedApp.title}.html`);
    } catch (error) {
      toast.error(`Download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // ── LANDING VIEW ──────────────────────────────────────────────
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden selection:bg-orange-500/30">

        <header role="banner" className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 flex-shrink-0 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] select-none"
            >
              R
            </div>
            <span className="font-black text-lg sm:text-xl tracking-tighter text-white">
              RAJ AI STUDIO
            </span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4" aria-label="Main navigation">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs font-mono text-slate-400 hover:text-orange-400 transition-colors uppercase tracking-wider"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate("/examples")}
              className="text-xs font-mono text-slate-400 hover:text-orange-400 transition-colors uppercase tracking-wider hidden sm:block"
            >
              Examples
            </button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400" aria-label="System status: online">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="hidden sm:inline">ONLINE</span>
            </div>
          </nav>
        </header>

        <main role="main" className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left image panel — desktop only */}
          <div className="hidden lg:block lg:w-1/2 relative overflow-hidden" aria-hidden="true">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/bg.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-zinc-950 pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>

          {/* Right hero content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-10 lg:px-14 xl:px-20 py-8 sm:py-12 lg:py-0 relative">

            {/* Mobile background */}
            <div
              className="absolute inset-0 lg:hidden"
              aria-hidden="true"
              style={{
                backgroundImage: "url('/bg.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
            <div className="absolute inset-0 lg:hidden bg-zinc-950/80" aria-hidden="true" />

            <div className="relative z-10 w-full max-w-lg">
              <p className="text-orange-500 text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4 text-center">
                AI App Generator
              </p>

              <h1 className="text-center font-black tracking-tight leading-[1.0] text-4xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 sm:mb-8">
                <span className="text-white block">IMAGINE</span>
                <span className="text-orange-500 block">CONSTRUCT</span>
                <span className="text-white block mt-1">DEPLOY</span>
              </h1>

              <form
                onSubmit={e => { e.preventDefault(); handleGenerate(); }}
                aria-label="App generation form"
              >
                <div className="rounded-xl border-2 border-zinc-700 bg-zinc-900 focus-within:border-orange-500 hover:border-zinc-600 transition-colors duration-200 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  <label htmlFor="prompt-input" className="sr-only">Describe your app</label>
                  <textarea
                    id="prompt-input"
                    rows={4}
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. A task manager with drag-and-drop, dark mode, and local storage..."
                    className="w-full bg-transparent px-4 pt-4 pb-2 text-sm sm:text-base text-white placeholder:text-zinc-500 outline-none resize-none leading-relaxed caret-orange-500 font-medium"
                    autoFocus
                    disabled={isGenerating}
                    aria-describedby="prompt-hint"
                  />
                  <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-3">
                    <span id="prompt-hint" className="text-[11px] text-zinc-500 font-mono hidden sm:block">
                      ⌘ Enter to generate
                    </span>
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="ml-auto flex items-center gap-2 px-5 py-3 sm:py-2.5 min-h-[44px] sm:min-h-0 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.5)] hover:shadow-[0_2px_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                      aria-label={isGenerating ? "Generating app..." : "Generate app"}
                    >
                      {isGenerating ? (
                        <><Loader2 size={13} className="animate-spin" aria-hidden="true" /><span>Building...</span></>
                      ) : (
                        <><Wand2 size={13} aria-hidden="true" /><span>Generate</span></>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>

        <footer role="contentinfo" className="relative z-10 py-3 flex justify-center items-center flex-shrink-0 border-t border-zinc-800/60">
          <p className="text-[11px] font-mono text-zinc-500">
            Built & Developed by{" "}
            <span className="text-orange-500 font-black tracking-wider">RAJ SHAH</span>
          </p>
        </footer>
      </div>
    );
  }

  // ── WORKSPACE VIEW ────────────────────────────────────────────
  if (!generatedApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white">No App Generated</h2>
          <p className="text-slate-400">Please generate an app first</p>
          <button
            onClick={() => setShowEditor(false)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black text-slate-300 overflow-hidden font-sans">

      {/* Header */}
      <header className="h-14 sm:h-16 border-b border-orange-900/30 bg-zinc-950 flex items-center justify-between px-3 sm:px-4 md:px-6 z-20 relative shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => setShowEditor(false)}
            className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-orange-700 transition-colors"
            aria-label="Back to home"
          >
            R
          </button>
          <div className="hidden sm:block h-5 w-px bg-orange-900/30 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest leading-none">Workspace</p>
            <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-xs">
              {generatedApp.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-orange-600 mr-1">
            <CheckCircle2 size={13} className="shrink-0" />
            <span className="hidden md:inline font-bold tracking-tight text-[10px]">BUILD COMPLETE</span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 transition-all"
            title="Copy code"
          >
            <Copy size={12} className="shrink-0" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            title="Export app"
          >
            <Save size={12} className="shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 font-mono text-[10px] sm:text-xs font-bold uppercase bg-zinc-800 text-slate-300 hover:text-white border border-zinc-700 hover:border-orange-500 transition-all"
            title="Go to dashboard"
          >
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* Mobile tab bar */}
      <div className="md:hidden h-12 bg-zinc-900 border-b border-zinc-800 flex shrink-0">
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase transition-colors ${
            activeTab === "code" ? "text-orange-500 bg-zinc-800 border-b-2 border-orange-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Code2 size={13} />
          Code
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-[10px] font-mono font-bold uppercase transition-colors ${
            activeTab === "preview" ? "text-orange-500 bg-zinc-800 border-b-2 border-orange-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          <Eye size={13} />
          Preview
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">

        {/* Code panel */}
        <div className={`flex-col w-full md:w-1/2 border-r border-orange-900/30 bg-black ${
          activeTab === "code" ? "flex flex-1" : "hidden md:flex"
        }`}>
          <div className="h-9 bg-zinc-950 border-b border-orange-900/30 flex items-center px-3 gap-3 shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/30 border border-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/30 border border-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/30 border border-green-500/50" />
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Code2 size={12} className="text-orange-600 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-orange-600 truncate">
                GENERATED_SOURCE.html
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <Editor
              defaultLanguage="html"
              value={displayedCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                readOnly: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 12, bottom: 12 },
                wordWrap: "on",
              }}
            />
          </div>
        </div>

        {/* Preview panel */}
        <div className={`w-full md:w-1/2 bg-zinc-950 flex flex-col ${
          activeTab === "preview" ? "flex flex-1" : "hidden md:flex"
        }`}>
          {/* Device toggle bar */}
          <div className="h-9 border-b border-orange-900/30 flex items-center justify-center gap-2 bg-black shrink-0">
            <button
              onClick={() => setDevice("mobile")}
              className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                device === "mobile"
                  ? "text-orange-500 bg-zinc-900 border border-orange-600"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              <Smartphone size={12} />
              <span className="hidden xs:inline">Mobile</span>
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-mono font-bold uppercase rounded transition-all ${
                device === "desktop"
                  ? "text-orange-500 bg-zinc-900 border border-orange-600"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              <Monitor size={12} />
              <span className="hidden xs:inline">Desktop</span>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(rgba(234,88,12,0.08)_1px,transparent_1px)] [background-size:20px_20px] overflow-auto min-h-0">
            {device === "mobile" ? (
              <div className="relative shrink-0 w-[300px] sm:w-[360px] h-[580px] sm:h-[700px] border-2 border-orange-600/50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)] bg-zinc-950 flex flex-col overflow-hidden">
                <div className="h-7 bg-black border-b border-orange-600/30 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <span className="ml-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">
                    {generatedApp.title}
                  </span>
                </div>
                <iframe
                  srcDoc={buildHtmlDocument(generatedApp, true)}
                  className="w-full flex-1 border-none bg-white"
                  title="App Preview"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              </div>
            ) : (
              <div className="w-full h-full border-2 border-orange-600/50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)] bg-zinc-950 flex flex-col overflow-hidden">
                <div className="h-7 bg-black border-b border-orange-600/30 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <span className="ml-2 text-[9px] font-mono text-zinc-500 uppercase tracking-widest truncate">
                    {generatedApp.title}
                  </span>
                </div>
                <iframe
                  srcDoc={buildHtmlDocument(generatedApp, true)}
                  className="w-full flex-1 border-none bg-white"
                  title="App Preview"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
