import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Sparkles, Send, Download, Copy, 
  Maximize2, Minimize2, RotateCcw,
  Wand2, Box, Grid3x3, Eye, EyeOff,
  ChevronRight, Terminal, Palette, Layout, FileCode
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
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isModifying, setIsModifying] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check for URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const promptParam = urlParams.get('prompt');
    if (promptParam) {
      setPrompt(decodeURIComponent(promptParam));
      // Clear URL parameter
      window.history.replaceState({}, '', '/');
      // Auto-focus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, []);

  const generateMutation = trpc.apps.generate.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      setGeneratedApp(data);
      setShowEditor(true);
      setChatMessages([
        {
          role: "assistant",
          content: `✨ I've generated your app! You can see the code and live preview. Feel free to ask me to modify anything!`,
        },
      ]);
    },
    onError: (error) => {
      setIsGenerating(false);
      console.error("Generation error:", error);
      alert(`Error generating app: ${error.message}\n\nPlease try again or simplify your prompt.`);
    },
  });

  const modifyMutation = trpc.apps.modify.useMutation({
    onSuccess: (data) => {
      setIsModifying(false);
      setGeneratedApp((prev: any) => ({
        ...prev,
        ...data,
      }));
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "✅ Done! I've updated your app. Check the preview to see the changes.",
        },
      ]);
    },
    onError: (error) => {
      setIsModifying(false);
      console.error("Modification error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Sorry, I couldn't make that change: ${error.message}. Please try rephrasing your request.`,
        },
      ]);
    },
  });

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && prompt.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please describe your app");
      return;
    }

    setIsGenerating(true);
    const sessionId = getOrCreateSessionId();
    generateMutation.mutate({ prompt: prompt.trim(), sessionId });
  };

  const handleChatSend = () => {
    if (!chatInput.trim() || !generatedApp) return;

    const userMessage = chatInput;
    const newMessages = [
      ...chatMessages,
      { role: "user", content: userMessage },
    ];
    setChatMessages(newMessages);
    setChatInput("");
    setIsModifying(true);

    const currentCode = `${generatedApp.htmlCode}\n\n<style>\n${generatedApp.cssCode}\n</style>\n\n<script>\n${generatedApp.jsCode}\n</script>`;
    modifyMutation.mutate({
      appId: generatedApp.id || 0,
      instruction: userMessage,
      currentCode,
    });
  };



  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'split'>('split');
  const [showMinimap, setShowMinimap] = useState(false);
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light'>('vs-dark');

  if (showEditor && generatedApp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Header */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl px-6 py-4"
        >
          <div className="flex items-center justify-between">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditor(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </motion.button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{generatedApp.title}</h2>
                  <p className="text-xs text-slate-400">Generated just now</p>
                </div>
              </div>
            </div>

            {/* Center - View Tabs */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
              {[
                { id: 'code', icon: Terminal, label: 'Code' },
                { id: 'split', icon: Grid3x3, label: 'Split' },
                { id: 'preview', icon: Eye, label: 'Preview' },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </motion.button>
              ))}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMinimap(!showMinimap)}
                className={`p-2 rounded-xl transition-all ${
                  showMinimap ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
                title="Toggle minimap"
              >
                <Box className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditorTheme(editorTheme === 'vs-dark' ? 'light' : 'vs-dark')}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                title="Toggle theme"
              >
                {editorTheme === 'vs-dark' ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </motion.button>

              <div className="w-px h-6 bg-white/10" />

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const code = `<!-- HTML -->\n${generatedApp.htmlCode}\n\n<!-- CSS -->\n<style>\n${generatedApp.cssCode}\n</style>\n\n<!-- JavaScript -->\n<script>\n${generatedApp.jsCode}\n</script>`;
                  navigator.clipboard.writeText(code);
                  toast.success("Code copied to clipboard!");
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 hover:text-white flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Copy</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                    console.error("Download error:", error);
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all text-white flex items-center gap-2 shadow-lg shadow-blue-500/30"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Export</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Editor and Preview */}
        <div className="relative z-10 flex-1 flex overflow-hidden">
          <AnimatePresence mode="wait">
            {/* Code Editor */}
            {(activeTab === 'code' || activeTab === 'split') && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`flex flex-col border-r border-white/10 overflow-hidden ${
                  activeTab === 'split' ? 'flex-1' : 'w-full'
                }`}
              >
                {/* Code Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-800/50 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Terminal className="w-4 h-4" />
                      <span className="text-sm font-medium">index.html</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">HTML • CSS • JavaScript</span>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1 overflow-hidden relative">
                  <Editor
                    defaultLanguage="html"
                    value={`${generatedApp.htmlCode}\n\n<style>\n${generatedApp.cssCode}\n</style>\n\n<script>\n${generatedApp.jsCode}\n</script>`}
                    theme={editorTheme}
                    options={{
                      minimap: { enabled: showMinimap },
                      fontSize: 14,
                      fontFamily: "'Fira Code', 'Monaco', 'Menlo', monospace",
                      readOnly: true,
                      scrollBeyondLastLine: false,
                      lineNumbers: 'on',
                      renderLineHighlight: 'all',
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Live Preview */}
            {(activeTab === 'preview' || activeTab === 'split') && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`flex flex-col overflow-hidden ${
                  activeTab === 'split' ? 'flex-1' : 'w-full'
                }`}
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-800/50 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">Live Preview</span>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-green-400 font-medium">Live</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                      title="Refresh"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="flex-1 overflow-hidden bg-white relative">
                  {/* Device Frame */}
                  <div className="absolute inset-4 bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-slate-900">
                    <iframe
                      srcDoc={`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${generatedApp.title}</title>\n  <style>\n    * {\n      margin: 0;\n      padding: 0;\n      box-sizing: border-box;\n    }\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n    }\n    ${generatedApp.cssCode || ""}\n  </style>\n</head>\n<body>\n  ${generatedApp.htmlCode || ""}\n  <script>\n    ${generatedApp.jsCode || ""}\n  </script>\n</body>\n</html>`}
                      className="w-full h-full border-none"
                      title="App Preview"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Chat Interface */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 border-t border-white/10 bg-slate-900/90 backdrop-blur-xl"
        >
          <div className="max-w-full mx-auto flex flex-col h-64">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
                  <p className="text-xs text-slate-400">Refine your app with natural language</p>
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence>
                {chatMessages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-start gap-3 max-w-md">
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-800/80 text-slate-200 border border-white/10"
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">You</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 px-6 py-4">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isModifying) {
                      handleChatSend();
                    }
                  }}
                  placeholder="Ask AI to modify your app... e.g., 'Make it dark mode' or 'Add animations'"
                  disabled={isModifying}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-2xl px-6 py-4 pr-14 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isModifying}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
                >
                  {isModifying ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-500">Quick actions:</span>
                {["Add dark mode", "Make it responsive", "Add animations"].map((action, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setChatInput(action)}
                    className="px-3 py-1 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-slate-300 hover:text-white transition-all border border-white/5"
                  >
                    {action}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 border-b border-white/20 bg-white/60 backdrop-blur-xl px-6 md:px-12 py-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wand2 className="w-6 h-6 text-white" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-0"
              whileHover={{ opacity: 0.3 }}
            />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              AI Studio
            </h1>
            <p className="text-xs text-slate-500">Build anything, instantly</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/examples"}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Examples
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/templates"}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Templates
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            Pro
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-4xl space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
                  Build anything
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  with AI magic
                </span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Describe your vision in natural language. Watch as AI transforms your ideas into production-ready code in seconds.
            </motion.p>


          </div>

          {/* Input Area */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="relative"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
              
              {/* Input Container */}
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your app... e.g., 'A modern todo app with drag-and-drop, dark mode, and cloud sync'"
                  className="min-h-40 bg-transparent border-0 px-8 py-6 text-slate-900 placeholder-slate-400 focus:outline-none resize-none text-lg leading-relaxed"
                  disabled={isGenerating}
                />
                
                {/* Bottom Bar */}
                <div className="border-t border-slate-200/50 px-6 py-4 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = "/templates"}
                      className="p-2 hover:bg-white rounded-xl transition-colors"
                      title="Browse templates"
                    >
                      <Layout className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const colorSuggestion = "Use a modern color palette with gradients";
                        setPrompt(prev => prev ? `${prev}. ${colorSuggestion}` : colorSuggestion);
                        toast.success("Color palette suggestion added!");
                      }}
                      className="p-2 hover:bg-white rounded-xl transition-colors"
                      title="Add color palette suggestion"
                    >
                      <Palette className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const styleSuggestion = "Use clean, modern code with best practices";
                        setPrompt(prev => prev ? `${prev}. ${styleSuggestion}` : styleSuggestion);
                        toast.success("Code style suggestion added!");
                      }}
                      className="p-2 hover:bg-white rounded-xl transition-colors"
                      title="Add code style suggestion"
                    >
                      <FileCode className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 group"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating magic...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span>Generate App</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>


          </motion.div>


        </motion.div>
      </div>
    </div>
  );
}
