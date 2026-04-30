import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Copy, Download, Trash2, Code, FileText, Braces } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildCodeBundle, buildHtmlDocument } from "@/lib/app-code";

export default function AppViewer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const appId = parseInt(id || "0", 10);

  const { data: app, isLoading } = trpc.apps.get.useQuery(
    { id: appId },
    { enabled: appId > 0 }
  );

  const deleteMutation = trpc.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("App deleted successfully");
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete app: ${error.message || "An unexpected error occurred"}`);
      setDeleteDialogOpen(false);
    },
  });

  useEffect(() => {
    if (iframeRef.current && app) {
      iframeRef.current.srcdoc = buildHtmlDocument(app, true);
    }
  }, [app]);

  const handleCopyCode = async () => {
    if (!app) {
      toast.error("App data not available");
      return;
    }

    try {
      const code = buildCodeBundle(app);

      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to copy code: ${errorMessage}`);
    }
  };

  const handleDownload = () => {
    if (!app) return;

    const htmlContent = buildHtmlDocument(app);

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${app.title.replace(/\s+/g, "-").toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("App downloaded successfully!");
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteMutation.mutate({ id: appId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-orange-400 font-mono">LOADING PREVIEW...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center border-4 border-orange-600 p-8 shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] max-w-md w-full">
          <p className="text-white mb-6 font-mono text-xl font-black uppercase">App Not Found</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center gap-2 py-3 px-4 text-xs font-mono font-black"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-300 overflow-hidden font-sans relative">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-7xl">
        <div className="mb-8 sm:mb-12">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-6 px-4 py-2 text-[10px] sm:text-xs font-mono font-black uppercase bg-zinc-900 text-slate-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:text-orange-400 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl xs:text-4xl sm:text-5xl font-black text-white truncate tracking-tighter uppercase leading-none">{app.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <p className="text-orange-500 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest bg-orange-600/10 px-2 py-1 border border-orange-600/30">
                  Deployed: {new Date(app.generatedAt).toLocaleDateString()}
                </p>
                <div className="h-1 w-1 bg-zinc-800 rounded-full" />
                <p className="text-slate-500 text-[10px] sm:text-xs font-mono font-black uppercase tracking-widest">
                  ID: #{app.id}
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-zinc-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 min-h-[44px]"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-zinc-900 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-2 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending}
                className="px-4 py-2.5 text-[10px] sm:text-xs font-mono font-black uppercase bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 flex items-center gap-2 min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Destroy</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden group hover:shadow-[12px_12px_0px_0px_rgba(234,88,12,0.1)] transition-all">
              <div className="p-4 border-b-4 border-black bg-zinc-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 mr-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-black" />
                    <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-black" />
                  </div>
                  <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">Live Preview</h2>
                </div>
                <div className="flex items-center gap-2 text-orange-600">
                   <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
                   <span className="text-[10px] font-mono font-black">ACTIVE</span>
                </div>
              </div>
              <div className="p-4 sm:p-6 bg-[radial-gradient(rgba(234,88,12,0.05)_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-[450px] sm:h-[550px] lg:h-[650px] border-none"
                    title="App Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col hover:shadow-[10px_10px_0px_0px_rgba(234,88,12,0.1)] transition-all">
              <div className="p-4 border-b-4 border-black bg-zinc-900">
                <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">Configuration</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-6">
                <div>
                  <p className="text-orange-500 font-mono font-black uppercase text-[10px] mb-2 tracking-widest">Original Prompt</p>
                  <div className="p-3 bg-zinc-900 border-2 border-black text-xs sm:text-sm text-slate-400 leading-relaxed font-medium italic italic">
                    "{app.prompt}"
                  </div>
                </div>
                <div>
                  <p className="text-orange-500 font-mono font-black uppercase text-[10px] mb-2 tracking-widest">Payload Metrics</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { l: "HTML", v: app.htmlCode?.length || 0 },
                      { l: "CSS", v: app.cssCode?.length || 0 },
                      { l: "JS", v: app.jsCode?.length || 0 },
                    ].map((m, i) => (
                      <div key={i} className="bg-zinc-900 border-2 border-black p-2 text-center">
                        <p className="text-[9px] font-black text-white mb-1">{m.l}</p>
                        <p className="text-[10px] font-mono text-orange-400">{m.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col hover:shadow-[10px_10px_0px_0px_rgba(234,88,12,0.1)] transition-all">
              <div className="p-4 border-b-4 border-black bg-zinc-900">
                <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-tight">Component Source</h2>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { n: "HTML Structure", i: Code, v: app.htmlCode },
                  { n: "Style Definition", i: FileText, v: app.cssCode },
                  { n: "Logic Script", i: Braces, v: app.jsCode },
                ].map((s, i) => (
                  <details key={i} className="group border-2 border-black bg-zinc-900 overflow-hidden">
                    <summary className="cursor-pointer p-3 flex items-center justify-between hover:bg-zinc-800 transition-colors">
                      <div className="flex items-center gap-2">
                        <s.i className="w-4 h-4 text-orange-600" />
                        <span className="text-[10px] font-mono font-black uppercase tracking-tight text-white">{s.n}</span>
                      </div>
                      <div className="w-4 h-4 flex items-center justify-center text-slate-500 group-open:rotate-180 transition-transform">▼</div>
                    </summary>
                    <div className="p-3 border-t-2 border-black bg-black">
                      <pre className="text-[10px] font-mono text-orange-400 overflow-auto max-h-48 whitespace-pre-wrap leading-tight">
                        {s.v || "// EMPTY"}
                      </pre>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-950 border-4 border-black text-white rounded-none shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">Confirm Destruction</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium pt-2">
              Are you certain you want to destroy <span className="text-orange-500 font-bold underline">"{app?.title}"</span>? This process is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-4 mt-6">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-3 text-xs font-mono font-black uppercase bg-zinc-800 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="flex-1 px-4 py-3 text-xs font-mono font-black uppercase bg-red-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none flex items-center justify-center gap-2"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Destroy"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
