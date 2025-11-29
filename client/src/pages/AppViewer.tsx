import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Copy, Download, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function AppViewer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);

  const appId = parseInt(id || "0", 10);

  const { data: app, isLoading } = trpc.apps.get.useQuery(
    { id: appId },
    { enabled: appId > 0 }
  );

  const deleteMutation = trpc.apps.delete.useMutation({
    onSuccess: () => {
      toast.success("App deleted successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(`Error deleting app: ${error.message}`);
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

  const handleCopyCode = () => {
    if (!app) return;

    const code = `<!-- HTML -->
${app.htmlCode}

<!-- CSS -->
<style>
${app.cssCode}
</style>

<!-- JavaScript -->
<script>
${app.jsCode}
</script>`;

    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this app?")) {
      deleteMutation.mutate({ id: appId });
    }
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
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="sm"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{app.title}</h1>
              <p className="text-slate-600 text-sm mt-1">
                Created on {new Date(app.generatedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? "Copied!" : "Copy Code"}
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Live preview of your generated app</CardDescription>
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
                  <p className="text-slate-700 mt-1 line-clamp-3">{app.prompt}</p>
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
    </div>
  );
}
