import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Sparkles, Send, Download, Copy, 
  Maximize2, Minimize2, RotateCcw,
  Wand2, Box, Grid3x3, Eye, EyeOff,
  ChevronRight, Terminal, Settings, Code2, Smartphone, Monitor, Zap, ArrowRight, Save, CheckCircle2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrCreateSessionId } from "@/const";
import { toast } from "sonner";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      setGeneratedApp(data);
      setShowEditor(true);
      toast.success("✨ App generated successfully!");
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Generation error:", error);
      toast.error(`Error: ${error.message}`);
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
        <div className="absolute inset-0 z-0 opacity-[0.03]" 
             style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Header */}
        <header className="relative z-10 p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-[4px_4px_0px_0px_#000]">
              A
            </div>
            <span className="font-sans font-bold text-2xl tracking-tighter text-foreground">AI STUDIO</span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-mono text-muted-foreground">
            <span>v2.4.0-STABLE</span>
            <span className="text-orange-600 flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"/> SYSTEM ONLINE
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 relative z-10 flex flex-col justify-center items-center px-4 max-w-5xl mx-auto w-full">
          <div className="mb-12 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border rounded-full text-xs font-mono text-muted-foreground mb-4">
              <Zap size={12} className="text-orange-600" />
              <span>POWERED BY GROQ AI</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter leading-[0.9]">
              IMAGINE.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">CONSTRUCT.</span><br/>
              DEPLOY.
            </h1>
            <p className="max-w-xl mx-auto text-lg text-muted-foreground font-medium leading-relaxed">
              Turn natural language into production-grade applications. 
              No visual clutter. Just pure semantic creation.
            </p>
          </div>

          {/* Input Form */}
          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex bg-card shadow-2xl rounded-lg p-2 border border-border">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your app (e.g., 'A minimalist kanban board for remote teams')..."
                className="flex-1 bg-transparent px-6 py-4 text-lg outline-none text-foreground placeholder:text-muted-foreground font-medium"
                autoFocus
                disabled={isGenerating}
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="group relative px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-2 overflow-hidden bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ArrowRight size={16} />
                    <span>Initialize</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal Output */}
          <div className="absolute bottom-20 left-10 hidden lg:block opacity-20">
            <div className="font-mono text-xs space-y-1 text-foreground">
              <p>{'>'} WAITING FOR INPUT...</p>
              <p>{'>'} MEMORY ALLOCATED: 4096MB</p>
              <p>{'>'} LATENCY: 12ms</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Builder Workspace View
  const fullCode = `${generatedApp.htmlCode || ''}\n\n<style>\n${generatedApp.cssCode || ''}\n</style>\n\n<script>\n${generatedApp.jsCode || ''}\n</script>`;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-300 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 border-b border-border bg-slate-950 flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => setShowEditor(false)} className="hover:text-white transition-colors">
            <div className="w-8 h-8 bg-orange-600 flex items-center justify-center text-white font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
          </button>
          <div className="h-6 w-px bg-border"></div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">Workspace</h2>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{generatedApp.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-green-500">
            <CheckCircle2 size={12} />
            BUILD COMPLETE
          </div>
          
          <button
            onClick={() => {
              const code = fullCode;
              navigator.clipboard.writeText(code);
              toast.success("Code copied to clipboard!");
            }}
            className="group relative px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-2 bg-slate-900 text-white border border-slate-800 hover:border-orange-500"
          >
            <Copy size={14} />
            Copy
          </button>
          
          <button
            onClick={() => {
              try {
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
                toast.success(`Downloaded ${generatedApp.title}.html`);
              } catch (error) {
                toast.error("Failed to download file");
              }
            }}
            className="group relative px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Save size={14} />
            Export
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Code Panel */}
        <div className="w-1/2 flex flex-col border-r border-border bg-slate-950">
          <div className="h-10 bg-slate-900 border-b border-border flex items-center px-4 justify-between">
            <div className="flex items-center gap-2">
              <Code2 size={14} className="text-orange-600" />
              <span className="text-xs font-mono font-bold text-muted-foreground">GENERATED_SOURCE.html</span>
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
                lineNumbers: 'on',
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-1/2 bg-slate-900 relative flex flex-col">
          <div className="h-12 border-b border-border flex justify-center items-center gap-4 bg-slate-950 shadow-md z-10">
            <button 
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded transition-colors ${device === 'mobile' ? 'text-orange-500 bg-slate-800' : 'text-muted-foreground hover:text-white'}`}
            >
              <Smartphone size={16} />
            </button>
            <button 
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded transition-colors ${device === 'desktop' ? 'text-orange-500 bg-slate-800' : 'text-muted-foreground hover:text-white'}`}
            >
              <Monitor size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] overflow-hidden relative">
            <div className={`
              bg-white relative transition-all duration-500 ease-in-out shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-[8px] border-slate-800
              ${device === 'mobile' ? 'w-[375px] h-[750px] rounded-[3rem]' : 'w-full h-full max-h-[800px] rounded-lg'}
            `}>
              {device === 'mobile' && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-slate-800 rounded-b-xl z-20"></div>
              )}

              <div className={`w-full h-full overflow-y-auto ${device === 'mobile' ? 'rounded-[2.5rem]' : ''}`}>
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
