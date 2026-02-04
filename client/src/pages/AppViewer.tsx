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
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${app.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            ${app.cssCode || ""}
          </style>
        </head>
        <body>
          ${app.htmlCode || ""}
          <script>
            ${app.jsCode || ""}
          </script>
        </body>
        </html>
      `;

      iframeRef.current.srcdoc = htmlContent;
    }
  }, [app]);

  const handleCopyCode = async () => {
    if (!app) {
      toast.error("App data not available");
      return;
    }

    try {
      const code = `<!-- HTML -->
${app.htmlCode || ""}

<!-- CSS -->
<style>
${app.cssCode || ""}
</style>

<!-- JavaScript -->
<script>
${app.jsCode || ""}
</script>`;

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

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${app.title}</title>
  <style>
    ${app.cssCode || ""}
  </style>
</head>
<body>
  ${app.htmlCode || ""}
  <script>
    ${app.jsCode || ""}
  </script>
</body>
</html>`;

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
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-slate-400 text-sm sm:text-base">Loading your app...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4 text-sm sm:text-base">App not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-xs sm:text-sm font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
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

      <div className="relative z-10 container mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] xs:text-xs sm:text-sm font-mono font-bold uppercase bg-zinc-900 text-slate-400 border border-orange-900/50 hover:border-orange-500 hover:text-orange-400 rounded transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white truncate tracking-tighter">{app.title}</h1>
              <p className="text-orange-500 text-[10px] xs:text-xs sm:text-sm mt-1 font-mono">
                Created on {new Date(app.generatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-1.5 xs:gap-2 flex-wrap">
              <button
                onClick={handleCopyCode}
                className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all flex items-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-[44px]"
              >
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{copied ? "Copied!" : "Copy"}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all flex items-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-[44px]"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Download</span>
              </button>
              <button
                onClick={handleDeleteClick}
                disabled={deleteMutation.isPending}
                className="px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase bg-red-900/20 text-red-500 border border-red-900/50 hover:border-red-500 hover:bg-red-900/30 rounded transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2 min-h-[36px] sm:min-h-[44px]"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2">
            <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
              <div className="p-3 sm:p-4 border-b border-orange-900/30">
                <h2 className="text-sm sm:text-base font-bold text-white">Preview</h2>
                <p className="text-[10px] xs:text-xs sm:text-sm text-slate-400 mt-1">
                  Live preview of your generated app
                </p>
              </div>
              <div className="p-3 sm:p-4">
                <div className="border border-orange-900/30 rounded-lg overflow-hidden bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-72 sm:h-96 border-none"
                    title="App Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
              <div className="p-3 sm:p-4 border-b border-orange-900/30">
                <h2 className="text-sm sm:text-base font-bold text-white">App Details</h2>
              </div>
              <div className="p-3 sm:p-4 space-y-3 text-xs sm:text-sm">
                <div>
                  <p className="text-orange-400 font-mono uppercase text-[10px] xs:text-xs">Prompt</p>
                  <p className="text-slate-300 mt-1 line-clamp-3">
                    {app.prompt}
                  </p>
                </div>
                <div>
                  <p className="text-orange-400 font-mono uppercase text-[10px] xs:text-xs">Code Stats</p>
                  <div className="mt-1 space-y-1 text-slate-400 font-mono text-[10px] xs:text-xs">
                    <p>HTML: {app.htmlCode?.length || 0} chars</p>
                    <p>CSS: {app.cssCode?.length || 0} chars</p>
                    <p>JS: {app.jsCode?.length || 0} chars</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-zinc-950 border border-orange-900/30 rounded-lg overflow-hidden hover:border-orange-500/50 transition-all">
              <div className="p-3 sm:p-4 border-b border-orange-900/30">
                <h2 className="text-sm sm:text-base font-bold text-white">Code Sections</h2>
              </div>
              <div className="p-3 sm:p-4 space-y-2">
                <details className="text-xs sm:text-sm group">
                  <summary className="cursor-pointer font-mono text-orange-400 hover:text-orange-300 flex items-center gap-2 py-1">
                    <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                    HTML
                  </summary>
                  <pre className="mt-2 p-2 sm:p-3 bg-zinc-900 border border-orange-900/30 rounded text-[10px] xs:text-xs overflow-auto max-h-32 sm:max-h-40 text-slate-300">
                    {app.htmlCode}
                  </pre>
                </details>
                <details className="text-xs sm:text-sm group">
                  <summary className="cursor-pointer font-mono text-orange-400 hover:text-orange-300 flex items-center gap-2 py-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                    CSS
                  </summary>
                  <pre className="mt-2 p-2 sm:p-3 bg-zinc-900 border border-orange-900/30 rounded text-[10px] xs:text-xs overflow-auto max-h-32 sm:max-h-40 text-slate-300">
                    {app.cssCode}
                  </pre>
                </details>
                <details className="text-xs sm:text-sm group">
                  <summary className="cursor-pointer font-mono text-orange-400 hover:text-orange-300 flex items-center gap-2 py-1">
                    <Braces className="w-3 h-3 sm:w-4 sm:h-4" />
                    JavaScript
                  </summary>
                  <pre className="mt-2 p-2 sm:p-3 bg-zinc-900 border border-orange-900/30 rounded text-[10px] xs:text-xs overflow-auto max-h-32 sm:max-h-40 text-slate-300">
                    {app.jsCode}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-zinc-950 border border-orange-900/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Delete App</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete "{app?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-xs sm:text-sm font-mono font-bold uppercase bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 rounded transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 text-xs sm:text-sm font-mono font-bold uppercase bg-red-600 text-white hover:bg-red-700 rounded transition-all flex items-center gap-2"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
