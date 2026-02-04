import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import AIChat from "@/components/AIChat";
import { Download, Save, ArrowLeft, Loader2, Code, Eye } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type ActiveTab = "editor" | "preview";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [code, setCode] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor"); // Default to code generation

  const appId = parseInt(id || "0", 10);

  // Fetch app data
  const { data: app, isLoading } = trpc.apps.get.useQuery(
    { id: appId },
    { enabled: appId > 0 }
  );

  // Update app mutation
  const updateApp = trpc.apps.update.useMutation({
    onSuccess: () => {
      toast.success("App saved successfully");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  // Modify app with AI
  const modifyApp = trpc.apps.modify.useMutation({
    onSuccess: (data: any) => {
      const fullCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title}</title>
  <style>
    ${data.cssCode || ""}
  </style>
</head>
<body>
  ${data.htmlCode || ""}
  <script>
    ${data.jsCode || ""}
  </script>
</body>
</html>`;
      setCode(fullCode);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "App updated successfully! Check the preview to see the changes.",
        },
      ]);
    },
    onError: (error: any) => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't update the app: ${error.message}`,
        },
      ]);
    },
  });

  useEffect(() => {
    if (app) {
      const fullCode = `<!DOCTYPE html>
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
      setCode(fullCode);
    }
  }, [app]);

  const handleSave = async () => {
    if (!appId) {
      toast.error("Invalid app ID");
      return;
    }

    try {
      const htmlMatch = code.match(/<body>([\s\S]*?)<\/body>/);
      const cssMatch = code.match(/<style>([\s\S]*?)<\/style>/);
      const jsMatch = code.match(/<script>([\s\S]*?)<\/script>/);

      await updateApp.mutateAsync({
        id: appId,
        htmlCode: htmlMatch ? htmlMatch[1].trim() : "",
        cssCode: cssMatch ? cssMatch[1].trim() : "",
        jsCode: jsMatch ? jsMatch[1].trim() : "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to save: ${errorMessage}`);
    }
  };

  const handleAIChat = async (message: string) => {
    if (!appId) {
      toast.error("Invalid app ID");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a modification request");
      return;
    }

    setChatMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      await modifyApp.mutateAsync({ id: appId, instruction: message.trim() });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I encountered an error: ${errorMessage}`,
        },
      ]);
    }
  };

  const handleDownload = () => {
    if (!app) {
      toast.error("App data not available");
      return;
    }

    try {
      const blob = new Blob([code], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${app.title.replace(/\s+/g, "-").toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("App downloaded successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to download: ${errorMessage}`);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">App not found</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
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
            onClick={() => navigate("/dashboard")}
            className="hover:text-white transition-colors shrink-0"
          >
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-orange-600 flex items-center justify-center text-white font-bold text-xs xs:text-sm sm:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              A
            </div>
          </button>
          <div className="h-4 xs:h-5 sm:h-6 w-px bg-orange-900/30 hidden sm:block"></div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[10px] xs:text-xs sm:text-sm font-bold text-white tracking-wide uppercase truncate">
              Editor
            </h2>
            <p className="text-[9px] xs:text-[10px] sm:text-xs text-orange-400 truncate max-w-[120px] xs:max-w-[200px] sm:max-w-[250px]">
              {app?.title || "Untitled App"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-4 shrink-0">
          <button
            onClick={handleSave}
            disabled={updateApp.isPending}
            className="group relative px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-1.5 sm:py-2 font-mono text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 xs:gap-1 sm:gap-2 bg-zinc-900 text-white border border-orange-900/50 hover:border-orange-500 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed min-h-[32px] xs:min-h-[36px] sm:min-h-0"
            title="Save changes"
          >
            {updateApp.isPending ? (
              <Loader2 size={12} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 animate-spin flex-shrink-0" />
            ) : (
              <Save size={12} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            )}
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={handleDownload}
            className="group relative px-1.5 xs:px-2 sm:px-3 py-1.5 xs:py-1.5 sm:py-2 font-mono text-[9px] xs:text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out flex items-center gap-1 xs:gap-1 sm:gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] min-h-[32px] xs:min-h-[36px] sm:min-h-0"
            title="Export app"
          >
            <Download size={12} className="xs:w-3 xs:h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as ActiveTab)}
        className="flex-1 flex flex-col overflow-hidden relative z-10"
      >
        {/* Tab Navigation - visible on mobile */}
        <div className="md:hidden h-9 xs:h-10 bg-black/80 border-b border-orange-900/30 flex items-center gap-1.5 xs:gap-2 px-2 xs:px-4">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-2 xs:px-3 py-1.5 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase transition-all min-h-[32px] flex items-center justify-center ${
              activeTab === "editor"
                ? "text-orange-400 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-orange-400"
            }`}
          >
            <Code className="w-3 h-3 inline mr-1 flex-shrink-0" />
            <span className="hidden xs:inline">Generate</span>
            <span className="xs:hidden">Code</span>
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-2 xs:px-3 py-1.5 text-[9px] xs:text-[10px] sm:text-xs font-mono font-bold uppercase transition-all min-h-[32px] flex items-center justify-center ${
              activeTab === "preview"
                ? "text-orange-400 border-b-2 border-orange-600"
                : "text-slate-500 hover:text-orange-400"
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1 flex-shrink-0" />
            Preview
          </button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Panel - hidden on mobile when preview is active */}
          <div
            className={`hidden md:flex flex-col w-full md:w-1/2 border-r-0 md:border-r border-b md:border-b-0 border-orange-900/30 bg-black/50 backdrop-blur-sm ${
              activeTab === "editor" && "md:hidden"
            }`}
          >
            <div className="h-10 bg-zinc-950 border-b border-orange-900/30 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-orange-600" />
                <span className="text-xs font-mono font-bold text-orange-400">
                  SOURCE.html
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <CodeEditor value={code} onChange={setCode} language="html" />
            </div>
          </div>

          {/* Mobile Code Editor - shown when editor tab active on mobile */}
          <TabsContent
            value="editor"
            className="flex-1 flex flex-col md:hidden overflow-hidden"
          >
            <div className="h-10 bg-zinc-950 border-b border-orange-900/30 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-orange-600" />
                <span className="text-xs font-mono font-bold text-orange-400">
                  SOURCE.html
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor value={code} onChange={setCode} language="html" />
            </div>
          </TabsContent>

          {/* Preview & AI Chat Panel */}
          <div
            className={`flex-1 bg-zinc-950/50 backdrop-blur-sm relative flex flex-col ${
              activeTab === "editor" && "md:flex"
            }`}
          >
            {/* Desktop tabs */}
            <div className="hidden md:flex h-10 bg-black/80 border-b border-orange-900/30 items-center gap-2 px-4">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === "preview"
                    ? "text-orange-400 border-b-2 border-orange-600"
                    : "text-slate-500 hover:text-orange-400"
                }`}
              >
                <Eye className="w-3 h-3 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setActiveTab("editor")}
                className={`px-3 py-1.5 text-[10px] sm:text-xs font-mono font-bold uppercase transition-all ${
                  activeTab === "editor"
                    ? "text-orange-400 border-b-2 border-orange-600"
                    : "text-slate-500 hover:text-orange-400"
                }`}
              >
                <Code className="w-3 h-3 inline mr-1" />
                AI
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* Desktop preview */}
              <div className="hidden md:block h-full p-4 md:p-8 bg-[radial-gradient(rgba(234,88,12,0.1)_1px,transparent_1px)] [background-size:20px_20px]">
                {activeTab === "preview" && (
                  <LivePreview code={code} title={app.title} />
                )}
              </div>

              {/* Mobile preview */}
              <TabsContent value="preview" className="flex-1 flex md:hidden p-4 bg-[radial-gradient(rgba(234,88,12,0.1)_1px,transparent_1px)] [background-size:20px_20px]">
                <LivePreview code={code} title={app.title} />
              </TabsContent>

              {/* AI Chat */}
              {activeTab === "editor" && (
                <div className="h-full overflow-hidden">
                  <AIChat
                    messages={chatMessages}
                    onSendMessage={handleAIChat}
                    isLoading={modifyApp.isPending}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
