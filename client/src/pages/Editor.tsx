import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import CodeEditor from "@/components/CodeEditor";
import LivePreview from "@/components/LivePreview";
import AIChat from "@/components/AIChat";
import {
  Download,
  Save,
  ArrowLeft,
  Loader2,
  Code,
  Eye,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<ActiveTab>("editor");

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
      setChatMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content:
            "App updated successfully! Check the preview to see the changes.",
        },
      ]);
    },
    onError: (error: any) => {
      setChatMessages(prev => [
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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

    setChatMessages(prev => [...prev, { role: "user", content: message }]);

    try {
      await modifyApp.mutateAsync({ id: appId, instruction: message.trim() });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setChatMessages(prev => [
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
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
    <div className="h-screen flex flex-col bg-card">
      {/* Header */}
      <div className="bg-card border-b px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="h-6 w-px bg-border hidden sm:block" />
          <h1 className="text-sm sm:text-lg font-semibold truncate">{app.title}</h1>
        </div>
        <div className="flex gap-1 sm:gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={updateApp.isPending}
            className="text-xs sm:text-sm"
          >
            {updateApp.isPending ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="text-xs sm:text-sm">
            <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Tabs
            value={activeTab}
            onValueChange={(v: string) => setActiveTab(v as ActiveTab)}
            className="flex-1 flex flex-col"
          >
            <div className="border-b px-2 sm:px-4">
              <TabsList className="h-10 sm:h-12 w-full sm:w-auto">
                <TabsTrigger value="editor" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
                  <Code className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-initial">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Preview</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="editor" className="h-full mt-0 p-0">
                <CodeEditor value={code} onChange={setCode} language="html" />
              </TabsContent>

              <TabsContent value="preview" className="h-full mt-0 p-0">
                <LivePreview code={code} title={app.title} />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-full lg:w-96 xl:w-[28rem] border-t lg:border-t-0 lg:border-l bg-card flex-shrink-0 h-[300px] lg:h-auto">
          <AIChat
            messages={chatMessages}
            onSendMessage={handleAIChat}
            isLoading={modifyApp.isPending}
          />
        </div>
      </div>
    </div>
  );
}
