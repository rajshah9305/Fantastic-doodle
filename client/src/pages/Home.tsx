import {
  Loader2,
  Copy,
  Code2,
  Smartphone,
  Monitor,
  Zap,
  ArrowRight,
  Wand2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Editor from "@monaco-editor/react";
import { getOrCreateSessionId } from "@/const";
import { toast } from "sonner";
import type { GeneratedApp } from "@shared/types";
import { useTypewriter } from "@/hooks/useTypewriter";

interface GeneratedAppResponse {
  success: boolean;
  sessionId: string;
  title: string;
  htmlCode: string;
  cssCode: string | null;
  jsCode: string | null;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<GeneratedAppResponse | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [device, setDevice] = useState<"mobile" | "desktop">("mobile");
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data && data.htmlCode) {
        setGeneratedApp(data);
        setShowEditor(true);
        toast.success("✨ App generated successfully!");
      } else {
        toast.error("Invalid response from server");
      }
    },
    onError: (error: any) => {
      setIsGenerating(false);
      console.error("Generation error:", error);
      let message = "An unexpected error occurred";
      try {
        if (error && typeof error === 'object') {
          if ('message' in error) {
            message = (error as any).message || message;
          } else if ('data' in error && (error as any).data && typeof (error as any).data === 'object' && 'message' in (error as any).data) {
            message = (error as any).data.message || message;
          }
        }
      } catch (e) {
        console.error("Error parsing error:", e);
      }
      toast.error(`Failed to generate app: ${message}`);
    },
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your app");
      return;
    }

    setIsGenerating(true);
    const sessionId = getOrCreateSessionId();
    generateMutation.mutate({ prompt: prompt.trim(), sessionId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const fullCode = generatedApp ? `${generatedApp.htmlCode || ""}

<style>
${generatedApp.cssCode || ""}
</style>

<script>
${generatedApp.jsCode || ""}
</script>` : "";

  const displayedCode = useTypewriter(fullCode, 10);

  // Landing View
  if (!showEditor) {
    return (
      <div className="h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col relative overflow-hidden selection:bg-orange-200">
        {/* Background */}
        <div className="absolute inset-0 z-0"></div>

        {/* Subtle Grid Pattern Overlay */}
        <div
          className="absolute inset-0 z-[1] opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Header - Compact */}
        <header className="relative z-10 px-3 xs:px-4 sm:px-6 md:px-8 py-3 sm:py-4 flex justify-between items-center gap-2 flex-shrink-0 bg-white/10 backdrop-blur-sm border-b border-white/20">
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 min-w-0">
            <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-orange-600 flex items-center justify-center text-white font-bold text-base xs:text-lg sm:text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] flex-shrink-0 relative">
              A
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-orange-700 opacity-80 mix-blend-overlay"></div>
            </div>
            <span className="font-sans font-bold text-lg xs:text-xl sm:text-2xl tracking-tighter text-zinc-800 dark:text-white truncate drop-shadow-sm">
              AI STUDIO
            </span>
          </div>
          <div className="hidden md:flex gap-3 lg:gap-6 text-xs sm:text-sm font-mono text-zinc-600 dark:text-zinc-400 flex-shrink-0">
            <span className="hidden lg:inline bg-white/20 px-2 py-1 rounded text-xs">v2.4.0-STABLE</span>
            <span className="text-orange-600 flex items-center gap-1 bg-white/20 px-2 py-1 rounded">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />{" "}
              <span className="hidden lg:inline">SYSTEM ONLINE</span>
              <span className="lg:hidden">ONLINE</span>
            </span>
          </div>
        </header>

        {/* Main Content - Centered Vertically */}
        <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full">
          <div className="w-full space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
            {/* Badge */}
            <div className="flex justify-center animate-fade-in mb-8">
              <div className="inline-flex items-center gap-1.5 xs:gap-2 px-2.5 xs:px-3 py-1 xs:py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-mono text-zinc-700 dark:text-zinc-300 shadow-lg">
                <Zap size={10} className="xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-orange-600 animate-pulse flex-shrink-0" />
                <span>POWERED BY GROQ AI</span>
              </div>
            </div>

            {/* Hero Title */}
            <div className="text-center animate-fade-in-up">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-800 dark:text-white tracking-tighter leading-[0.9] px-2 drop-shadow-lg">
                IMAGINE.
                <br />
                <span className="text-orange-600">CONSTRUCT.</span>
                <br />
                DEPLOY.
              </h1>
            </div>

            {/* Subtitle */}
            <div className="text-center animate-fade-in-delay">
              <p className="max-w-xl mx-auto text-base xs:text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 font-medium leading-[1.6] px-3 xs:px-4 drop-shadow-sm">
                Turn natural language into production-grade applications. No
                visual clutter. Just pure semantic creation.
              </p>
            </div>

            {/* Input Form */}
            <div className="w-full max-w-2xl mx-auto relative group animate-fade-in-up-delay">
              <div className="relative flex flex-col sm:flex-row bg-white/30 dark:bg-zinc-800/30 backdrop-blur-md shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.3),0_4px_0_0_rgba(234,88,12,0.2)] rounded-lg p-1 xs:p-1.5 sm:p-2 border-2 border-white/40 dark:border-zinc-700/40 hover:border-orange-500/50 transition-all duration-300">
                <input
                  type="text"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your app..."
                  className="flex-1 bg-transparent px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-4 text-sm xs:text-base sm:text-lg outline-none text-zinc-800 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-400 font-medium transition-all duration-200 focus:placeholder:text-orange-500/50 caret-orange-600 min-h-[44px]"
                  autoFocus
                  disabled={isGenerating}
                />
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="group relative px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 font-mono text-[10px] xs:text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center justify-center gap-1.5 xs:gap-2 overflow-hidden bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] mt-1 sm:mt-0 rounded-md shadow-lg hover:shadow-xl"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={14} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 animate-spin flex-shrink-0" />
                      <span className="hidden xs:inline">Processing...</span>
                      <span className="xs:hidden">...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={14} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      <span>Initialize</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Credits Footer - Compact */}
        <footer className="relative z-10 py-3 sm:py-4 flex justify-center animate-fade-in px-3 xs:px-4 flex-shrink-0">
          <div className="text-center space-y-0.5 group cursor-default bg-white/10 dark:bg-zinc-800/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 dark:border-zinc-700/20">
            <p className="text-[9px] xs:text-[10px] sm:text-xs font-mono text-zinc-600 dark:text-zinc-400 transition-colors group-hover:text-orange-600/70">
              Built & Developed by
            </p>
            <p className="text-[10px] xs:text-xs sm:text-sm font-bold text-orange-600 tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:text-orange-500">
              RAJ SHAH
            </p>
          </div>
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
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
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
      <header className="h-12 xs:h-14 sm:h-16 border-b border-orange-900/30 bg-black/80 backdrop-blur-sm flex items-center justify-between px-2 xs:px-3 sm:px-4 md:px-6 z-20 relative gap-1.5 xs:gap-2">
        <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => setShowEditor(false)}
            className="hover:text-white transition-colors shrink-0"
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
          </button>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 hidden sm:block"></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[10px] xs:text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
              Workspace
            </h2>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-orange-400 truncate max-w-[100px] xs:max-w-[150px] sm:max-w-[200px]">
              {generatedApp?.title || "Untitled App"}
            </p>
          </div>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 ml-1 xs:ml-2 sm:ml-4 hidden md:block"></div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase leading-none mb-0.5">Built by</span>
            <span className="text-xs font-bold text-orange-500 leading-none tracking-wide">RAJ SHAH</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-mono text-orange-500 mr-2">
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
                const htmlContent = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp?.title || "Generated App"}</title>\n  <style>\n    ${generatedApp?.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp?.htmlCode || ""}\n  <script>\n    ${generatedApp?.jsCode || ""}\n  </script>\n</body>\n</html>`;
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
        <div className="w-full md:w-1/2 flex flex-col border-r-0 md:border-r border-b md:border-b-0 border-orange-900/30 bg-black/50 backdrop-blur-sm h-1/2 md:h-auto">
          <div className="h-8 xs:h-9 sm:h-10 bg-zinc-950 border-b border-orange-900/30 flex items-center px-2 xs:px-3 sm:px-4 gap-4 flex-shrink-0">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
            <div className="flex items-center gap-1.5 xs:gap-2 min-w-0 opacity-80">
              <Code2 size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold text-orange-400 truncate">
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
        <div className="w-full md:w-1/2 bg-zinc-950/50 backdrop-blur-sm relative flex flex-col h-1/2 md:h-auto">
          <div className="h-10 xs:h-11 sm:h-12 border-b border-orange-900/30 flex justify-center items-center gap-2 xs:gap-3 sm:gap-4 bg-black/80 backdrop-blur-sm shadow-md z-10 flex-shrink-0">
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 xs:p-2 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${device === "mobile" ? "text-orange-500 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-400 border border-transparent"}`}
            >
              <Smartphone size={14} className="xs:w-4 xs:h-4" />
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 xs:p-2 rounded transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center ${device === "desktop" ? "text-orange-500 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-400 border border-transparent"}`}
            >
              <Monitor size={14} className="xs:w-4 xs:h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-2 xs:p-4 sm:p-6 md:p-8 bg-[radial-gradient(rgba(234,88,12,0.1)_1px,transparent_1px)] [background-size:20px_20px] overflow-auto relative min-h-0">
            <div
              className={`
              bg-white relative transition-all duration-500 ease-in-out shadow-[0_25px_50px_-12px_rgba(234,88,12,0.3)] border-4 xs:border-[6px] sm:border-[8px] border-orange-900
              ${device === "mobile" ? "w-[280px] xs:w-[320px] sm:w-[375px] h-[560px] xs:h-[640px] sm:h-[750px] rounded-[2rem] xs:rounded-[2.5rem] sm:rounded-[3rem]" : "w-full h-full max-w-full max-h-full rounded-md xs:rounded-lg"}
            `}
            >
              {device === "mobile" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-4 xs:h-5 sm:h-6 w-20 xs:w-28 sm:w-32 bg-orange-900 rounded-b-lg xs:rounded-b-xl z-20"></div>
              )}

              <div
                className={`w-full h-full ${device === "mobile" ? "rounded-[1.75rem] xs:rounded-[2.25rem] sm:rounded-[2.5rem]" : "rounded-sm xs:rounded-md"}`}
              >
                <iframe
                  srcDoc={`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp.title}</title>\n  <style>\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    }\n    ${generatedApp.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp.htmlCode || ""}\n  <script>\n    ${generatedApp.jsCode || ""}\n  </script>\n</body>\n</html>`}
                  className="w-full h-full border-none"
                  title="App Preview"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
