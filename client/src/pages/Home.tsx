import {
  Loader2,
  Wand2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getOrCreateSessionId } from "@/const";
import { toast } from "sonner";
import { getDefaultAiModel } from "@/lib/models";

export default function Home() {
  const [, navigate] = useLocation();
  const urlPrompt = new URLSearchParams(window.location.search).get("prompt") || "";
  const [prompt, setPrompt] = useState(urlPrompt);

  useEffect(() => {
    if (urlPrompt) {
      const url = new URL(window.location.href);
      url.searchParams.delete("prompt");
      window.history.replaceState({}, "", url.toString());
    }
  }, [urlPrompt]);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      if (data && data.id) {
        toast.success("App generated successfully!");
        navigate(`/editor/${data.id}`);
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
    generateMutation.mutate({
      prompt: prompt.trim(),
      sessionId,
      model: getDefaultAiModel()
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden selection:bg-orange-500/30">

      <header role="banner" className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 flex-shrink-0 border-b border-zinc-200">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-orange-600 flex items-center justify-center text-white font-black text-base sm:text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] select-none active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
          >
            R
          </button>
          <span className="font-black text-lg sm:text-xl tracking-tighter text-zinc-950 uppercase">
            RAJ AI STUDIO
          </span>
        </div>
        <nav className="flex items-center gap-3 sm:gap-4" aria-label="Main navigation">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-[10px] sm:text-xs font-mono font-black text-zinc-500 hover:text-orange-600 transition-colors uppercase tracking-widest min-h-[44px] px-2"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/examples")}
            className="text-[10px] sm:text-xs font-mono font-black text-zinc-500 hover:text-orange-600 transition-colors uppercase tracking-widest min-h-[44px] px-2 hidden xs:block"
          >
            Examples
          </button>
          <button
            onClick={() => navigate("/templates")}
            className="text-[10px] sm:text-xs font-mono font-black text-zinc-500 hover:text-orange-600 transition-colors uppercase tracking-widest min-h-[44px] px-2 hidden sm:block"
          >
            Templates
          </button>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono font-black text-orange-400 tracking-widest" aria-label="System status: online">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" aria-hidden="true" />
            <span className="hidden md:inline">SYSTEM_ONLINE</span>
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
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-white pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none" />
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
          <div className="absolute inset-0 lg:hidden bg-white/80" aria-hidden="true" />

          <div className="relative z-10 w-full max-w-lg">
            <p className="text-orange-500 text-[10px] sm:text-xs font-mono font-black tracking-[0.3em] uppercase mb-4 text-center leading-none">
              Industrial AI Engine
            </p>

            <h1 className="text-center font-black tracking-tighter leading-[0.9] text-5xl sm:text-7xl md:text-8xl lg:text-9xl mb-8 sm:mb-12">
              <span className="text-zinc-950 block">IMAGINE</span>
              <span className="text-orange-600 block">CONSTRUCT</span>
              <span className="text-zinc-950 block mt-2">DEPLOY</span>
            </h1>

            <form
              onSubmit={e => { e.preventDefault(); handleGenerate(); }}
              aria-label="App generation form"
            >
              <div className="rounded-none border-4 border-black bg-zinc-100 focus-within:border-orange-600 hover:border-zinc-700 transition-colors duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <label htmlFor="prompt-input" className="sr-only">Describe your app</label>
                <textarea
                  id="prompt-input"
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. A task manager with drag-and-drop, dark mode, and local storage..."
                  className="w-full bg-transparent px-4 sm:px-6 pt-6 pb-2 text-sm sm:text-lg text-zinc-950 placeholder:text-zinc-500 outline-none resize-none leading-relaxed caret-orange-600 font-bold italic"
                  autoFocus
                  disabled={isGenerating}
                  aria-describedby="prompt-hint"
                />

                <div className="flex items-center justify-between px-4 sm:px-6 pb-4 sm:pb-6 pt-2 gap-4">
                  <span id="prompt-hint" className="text-[10px] text-zinc-500 font-mono font-black uppercase tracking-widest hidden sm:block">
                    [ CTRL + ENTER ] TO INITIALIZE
                  </span>
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="ml-auto flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono text-xs sm:text-sm font-black uppercase tracking-[0.2em] rounded-none transition-all duration-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-orange-400"
                    aria-label={isGenerating ? "Generating app..." : "Generate app"}
                  >
                    {isGenerating ? (
                      <><Loader2 size={16} className="animate-spin" aria-hidden="true" /><span className="animate-pulse">Constructing...</span></>
                    ) : (
                      <><Wand2 size={16} aria-hidden="true" /><span>Construct</span></>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer role="contentinfo" className="relative z-10 py-4 flex justify-center items-center flex-shrink-0 border-t-4 border-black bg-white">
        <p className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-[0.3em]">
          Engineered by <span className="text-orange-600">RAJ_SHAH</span> // Ver 1.0.0
        </p>
      </footer>
    </div>
  );
}
