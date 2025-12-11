import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, Copy, Download, Trash2 } from "lucide-react";
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading your app...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">App not found</p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-3 sm:mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">{app.title}</h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1">
                Created on {new Date(app.generatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleCopyCode} variant="outline" size="sm" className="text-xs sm:text-sm min-h-[44px]">
                <Copy className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Code"}</span>
                <span className="sm:hidden">{copied ? "Copied!" : "Copy"}</span>
              </Button>
              <Button onClick={handleDownload} variant="outline" size="sm" className="text-xs sm:text-sm min-h-[44px]">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download</span>
                <span className="sm:hidden">DL</span>
              </Button>
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
                className="text-xs sm:text-sm min-h-[44px]"
                title="Delete app"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  Live preview of your generated app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-96 border-none"
                    title="App Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">App Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-600 font-medium">Prompt</p>
                  <p className="text-slate-700 mt-1 line-clamp-3">
                    {app.prompt}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 font-medium">Code Stats</p>
                  <p className="text-slate-700 mt-1">
                    HTML: {app.htmlCode?.length || 0} chars
                  </p>
                  <p className="text-slate-700">
                    CSS: {app.cssCode?.length || 0} chars
                  </p>
                  <p className="text-slate-700">
                    JS: {app.jsCode?.length || 0} chars
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Code Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    HTML
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                    {app.htmlCode}
                  </pre>
                </details>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    CSS
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                    {app.cssCode}
                  </pre>
                </details>
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-slate-700 hover:text-slate-900">
                    JavaScript
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                    {app.jsCode}
                  </pre>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete App</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{app?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
