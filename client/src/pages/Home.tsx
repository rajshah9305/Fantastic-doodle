import {
  Loader2,
  Copy,
  Code2,
  Smartphone,
  Monitor,
  Zap,
  ArrowRight,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import Editor from "@monaco-editor/react";
import { getOrCreateSessionId } from "@/const";
import { toast } from "sonner";
import type { GeneratedApp } from "@shared/types";

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

  // Landing View
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-orange-200">
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        ></div>

        {/* Header */}
        <header className="relative z-10 p-4 sm:p-6 md:p-8 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-600 flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-[4px_4px_0px_0px_#000]">
              A
            </div>
            <span className="font-sans font-bold text-xl sm:text-2xl tracking-tighter text-foreground">
              AI STUDIO
            </span>
          </div>
          <div className="hidden md:flex gap-4 lg:gap-6 text-xs sm:text-sm font-mono text-muted-foreground">
            <span>v2.4.0-STABLE</span>
            <span className="text-orange-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />{" "}
              SYSTEM ONLINE
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative z-10 flex flex-col items-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto w-full pt-8 sm:pt-12 md:pt-16 pb-20 sm:pb-24">
          <div className="mb-6 sm:mb-8 text-center space-y-4 sm:space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-full text-[10px] sm:text-xs font-mono text-muted-foreground mb-2 sm:mb-3 animate-fade-in">
              <Zap size={10} className="sm:w-3 sm:h-3 text-orange-600 animate-pulse" />
              <span>POWERED BY GROQ AI</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground tracking-tighter leading-[0.9] animate-fade-in-up px-2">
              IMAGINE.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 animate-gradient">
                CONSTRUCT.
              </span>
              <br />
              DEPLOY.
            </h1>
            <p className="max-w-xl mx-auto text-base sm:text-lg text-muted-foreground font-medium leading-relaxed animate-fade-in-delay px-4">
              Turn natural language into production-grade applications. No
              visual clutter. Just pure semantic creation.
            </p>
          </div>

          {/* Input Form - Moved Higher */}
          <div className="w-full max-w-2xl relative group mt-4 sm:mt-6 animate-fade-in-up-delay">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
            <div className="relative flex flex-col sm:flex-row bg-card shadow-2xl rounded-lg p-1.5 sm:p-2 border-2 border-border hover:border-orange-500/50 transition-all duration-300">
              <input
                type="text"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your app..."
                className="flex-1 bg-transparent px-4 sm:px-6 py-3 sm:py-4 md:py-5 text-base sm:text-lg outline-none text-foreground placeholder:text-muted-foreground font-medium transition-all duration-200 focus:placeholder:text-orange-500/30"
                autoFocus
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="group relative px-6 sm:px-8 py-3 sm:py-4 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center justify-center gap-2 overflow-hidden bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed active:translate-x-[2px] active:translate-y-[2px] active:shadow-none min-h-[44px] sm:min-h-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                    <span>Initialize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Credits Footer - Fixed at Bottom */}
          <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center animate-fade-in px-4">
            <div className="text-center space-y-1 group cursor-default">
              <p className="text-[10px] sm:text-xs font-mono text-muted-foreground transition-colors group-hover:text-orange-600/70">
                Built & Developed by
              </p>
              <p className="text-xs sm:text-sm font-bold text-orange-600 tracking-wider transition-all duration-300 group-hover:scale-105 group-hover:text-orange-500">
                RAJ SHAH
              </p>
            </div>
          </div>
        </main>
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

  const fullCode = `${generatedApp.htmlCode || ""}

<style>
${generatedApp.cssCode || ""}
</style>

<script>
${generatedApp.jsCode || ""}
</script>`;

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
      <header className="h-14 sm:h-16 border-b border-orange-900/30 bg-black/80 backdrop-blur-sm flex items-center justify-between px-3 sm:px-4 md:px-6 z-20 relative gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => setShowEditor(false)}
            className="hover:text-white transition-colors shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
          </button>
          <div className="h-5 sm:h-6 w-px bg-orange-900/30 hidden sm:block"></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
              Workspace
            </h2>
            <p className="text-[10px] sm:text-xs text-orange-400 truncate max-w-[150px] sm:max-w-[200px]">
              {generatedApp?.title || "Untitled App"}
            </p>
          </div>
          <div className="h-5 sm:h-6 w-px bg-orange-900/30 ml-2 sm:ml-4 hidden md:block"></div>
          <div className="hidden lg:block">
            <p className="text-[10px] font-mono text-slate-500">Built by</p>
            <p className="text-xs font-bold text-orange-500">RAJ SHAH</p>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-[10px] sm:text-xs font-mono text-orange-500">
            <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden md:inline">BUILD COMPLETE</span>
          </div>

          <button
            onClick={() => {
              const code = fullCode;
              navigator.clipboard.writeText(code);
              toast.success("Code copied to clipboard!");
            }}
            className="group relative px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 sm:gap-2 bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 min-h-[36px] sm:min-h-0"
            title="Copy code"
          >
            <Copy size={12} className="sm:w-3.5 sm:h-3.5" />
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
            className="group relative px-2 sm:px-3 py-1.5 sm:py-2 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 sm:gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[36px] sm:min-h-0"
            title="Export app"
          >
            <Save size={12} className="sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
        {/* Code Panel */}
        <div className="w-full md:w-1/2 flex flex-col border-r-0 md:border-r border-b md:border-b-0 border-orange-900/30 bg-black/50 backdrop-blur-sm">
          <div className="h-10 bg-zinc-950 border-b border-orange-900/30 flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-orange-600" />
              <span className="text-xs font-mono font-bold text-orange-400">
                GENERATED_SOURCE.html
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              defaultLanguage="html"
              value={fullCode}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                readOnly: true,
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-full md:w-1/2 bg-zinc-950/50 backdrop-blur-sm relative flex flex-col">
          <div className="h-12 border-b border-orange-900/30 flex justify-center items-center gap-4 bg-black/80 backdrop-blur-sm shadow-md z-10">
            <button
              onClick={() => setDevice("mobile")}
              className={`p-2 rounded transition-colors ${device === "mobile" ? "text-orange-500 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-400 border border-transparent"}`}
            >
              <Smartphone size={16} />
            </button>
            <button
              onClick={() => setDevice("desktop")}
              className={`p-2 rounded transition-colors ${device === "desktop" ? "text-orange-500 bg-zinc-900 border border-orange-600" : "text-slate-400 hover:text-orange-400 border border-transparent"}`}
            >
              <Monitor size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(rgba(234,88,12,0.1)_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden relative">
            <div
              className={`
              bg-white relative transition-all duration-500 ease-in-out shadow-[0_25px_50px_-12px_rgba(234,88,12,0.3)] border-[8px] border-orange-900
              ${device === "mobile" ? "w-[375px] h-[750px] rounded-[3rem]" : "w-full h-full max-h-[800px] rounded-lg"}
            `}
            >
              {device === "mobile" && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-orange-900 rounded-b-xl z-20"></div>
              )}

              <div
                className={`w-full h-full overflow-y-auto ${device === "mobile" ? "rounded-[2.5rem]" : ""}`}
              >
                <iframe
                  srcDoc={`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp.title}</title>\n  <style>\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    }\n    ${generatedApp.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp.htmlCode || ""}\n  <script>\n    ${generatedApp.jsCode || ""}\n  </script>\n</body>\n</html>`}
                  className="w-full h-full border-none"
                  title="App Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
