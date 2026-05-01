import {
  Loader2,
  Copy,
  Code2,
  Smartphone,
  Monitor,
  Wand2,
  Save,
  CheckCircle2,
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

export default function Home() {
  const [, navigate] = useLocation();
  // Read ?prompt= from URL so Examples/Templates pages can pre-fill the input
  const urlPrompt = new URLSearchParams(window.location.search).get("prompt") || "";
  const [prompt, setPrompt] = useState(urlPrompt);
  const [generatedApp, setGeneratedApp] = useState<GeneratedAppResponse | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");

  // Clear the ?prompt param from the URL without a reload once we've read it
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

  // Landing View
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col overflow-hidden selection:bg-orange-500/30">

        {/* ── HEADER ─────────────────────────────────────────────── */}
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
          <div className="flex items-center gap-1.5 text-xs font-mono text-orange-400" aria-label="System status: online">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true" />
            <span className="hidden sm:inline">SYSTEM ONLINE</span>
          </div>
        </header>

        {/* ── BODY ───────────────────────────────────────────────── */}
        <main role="main" className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* LEFT — image panel (hidden on small screens, shown lg+) */}
          <div
            className="hidden lg:block lg:w-1/2 relative overflow-hidden"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: "url('/bg.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
              }}
            />
            {/* Subtle right-edge blend */}
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-zinc-950 pointer-events-none" />
            {/* Bottom fade */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>

          {/* RIGHT — hero content */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-5 sm:px-10 lg:px-14 xl:px-20 py-10 lg:py-0 relative">

            {/* Mobile: show image as background on small screens */}
            <div
              className="absolute inset-0 lg:hidden"
              aria-hidden="true"
              style={{
                backgroundImage: "url('/bg.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center top",
              }}
            />
            <div className="absolute inset-0 lg:hidden bg-zinc-950/75" aria-hidden="true" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-lg">

              {/* Eyebrow label */}
              <p className="text-orange-500 text-xs font-mono font-bold tracking-[0.2em] uppercase mb-4 text-center">
                AI App Generator
              </p>

              {/* Headline */}
              <h1 className="text-center font-black tracking-tight leading-[1.0] text-5xl sm:text-6xl md:text-7xl mb-5">
                <span className="text-white block">IMAGINE</span>
                <span className="text-orange-500 block">
                  CONSTRUCT
                </span>
                <span className="text-white block mt-1">DEPLOY</span>
              </h1>



              {/* Prompt form */}
              <form
                onSubmit={e => { e.preventDefault(); handleGenerate(); }}
                aria-label="App generation form"
              >
                <div className="rounded-xl border-2 border-zinc-700 bg-zinc-900 focus-within:border-orange-500 hover:border-zinc-600 transition-colors duration-200 shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden">
                  <label htmlFor="prompt-input" className="sr-only">
                    Describe your app
                  </label>
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
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs font-bold uppercase tracking-widest rounded-lg transition-all duration-200 active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.5)] hover:shadow-[0_2px_0_rgba(0,0,0,0.5)] hover:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
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

        {/* ── FOOTER ─────────────────────────────────────────────── */}
        <footer role="contentinfo" className="relative z-10 py-3 flex justify-center items-center flex-shrink-0 border-t border-zinc-800/60">
          <p className="text-[11px] font-mono text-zinc-500">
            Built & Developed by{" "}
            <span className="text-orange-500 font-black tracking-wider">RAJ SHAH</span>
          </p>
        </footer>

      </div>
    );
  }

  // Builder Workspace View
  if (!generatedApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            No App Generated
          </h2>
          <p className="text-muted-foreground">Please generate an app first</p>
          <button
            onClick={() => setShowEditor(false)}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-600/90"
          >
            Go Back
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
      <header className="h-12 xs:h-14 sm:h-16 border-b border-orange-900/30 bg-black flex items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 z-20 relative gap-1.5 xs:gap-2">
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => setShowEditor(false)}
            className="hover:text-white transition-colors shrink-0"
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              R
            </div>
          </button>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 hidden sm:block"></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[10px] xs:text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
              Workspace
            </h2>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-orange-600 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
              {generatedApp?.title || "Untitled App"}
            </p>
          </div>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 ml-1 xs:ml-2 sm:ml-4 hidden md:block"></div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase leading-none mb-0.5">Built by</span>
            <span className="text-xs font-bold text-orange-600 leading-none tracking-wide">RAJ SHAH</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-mono text-orange-600 mr-2">
            <CheckCircle2 size={14} className="flex-shrink-0" />
            <span className="hidden md:inline font-bold tracking-tight">BUILD COMPLETE</span>
          </div>

          <button
            onClick={() => {
              const code = fullCode;
              navigator.clipboard.writeText(code);
              toast.success("Code copied to clipboard!");
            }}
            className="group relative px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-2 bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 hover:shadow-[4px_4px_0px_0px_rgba(234,88,12,0.2)]"
            title="Copy code"
          >
            <Copy size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            onClick={() => {
              try {
                const htmlContent = buildHtmlDocument(generatedApp || {});
                const blob = new Blob([htmlContent], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${(generatedApp?.title || "app").replace(/\s+/g, "-").toLowerCase()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                toast.success(`Downloaded ${generatedApp.title}.html`);
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                toast.error(`Failed to download file: ${errorMessage}`);
              }
            }}
            className="group relative px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            title="Export app"
          >
            <Save size={14} className="flex-shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Code Panel */}
        <div className="w-full md:w-1/2 flex flex-col border-r-0 md:border-r border-b md:border-b-0 border-orange-900/30 bg-black h-1/2 md:h-auto">
          <div className="h-8 xs:h-9 sm:h-10 bg-zinc-950 border-b border-orange-900/30 flex items-center px-2 xs:px-3 sm:px-4 gap-4 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 min-w-0 opacity-80">
              <Code2 size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-orange-600 truncate">
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
                fontSize: 11,
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                readOnly: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-full md:w-1/2 bg-zinc-950 relative flex flex-col h-1/2 md:h-auto">
          <div className="h-10 xs:h-11 sm:h-12 border-b border-orange-900/30 flex justify-center items-center gap-2 xs:gap-3 sm:gap-4 bg-black shadow-md z-10 flex-shrink-0">
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 xs:p-2 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${device === "mobile" ? "text-orange-600 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-600 border border-transparent"}`}
            >
              <Smartphone size={14} className="xs:w-4 xs:h-4" />
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 xs:p-2 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${device === "desktop" ? "text-orange-600 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-600 border border-transparent"}`}
            >
              <Monitor size={14} className="xs:w-4 xs:h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 xs:p-4 sm:p-6 md:p-8 bg-[radial-gradient(rgba(234,88,12,0.1)_1px,transparent_1px)] [background-size:20px_20px] overflow-auto relative min-h-0">
            {/* Mobile frame */}
            {device === "mobile" && (
              <div className="relative flex-shrink-0 w-[280px] xs:w-[320px] sm:w-[375px] h-[560px] xs:h-[640px] sm:h-[750px] border-2 border-orange-600/50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)] bg-zinc-950 flex flex-col overflow-hidden">
                {/* Chrome bar */}
                <div className="h-8 bg-black border-b border-orange-600/30 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <span className="ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
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

            {/* Desktop frame */}
            {device === "desktop" && (
              <div className="w-full h-full border-2 border-orange-600/50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.4)] bg-zinc-950 flex flex-col overflow-hidden">
                {/* Chrome bar */}
                <div className="h-8 bg-black border-b border-orange-600/30 flex items-center px-3 gap-1.5 shrink-0">
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <div className="w-2 h-2 rounded-full bg-zinc-700 border border-zinc-600" />
                  <span className="ml-2 text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
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
