import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, Sparkles, Send, Download, Copy, 
  Maximize2, Minimize2, RotateCcw,
  Wand2, Box, Grid3x3, Eye, EyeOff,
  ChevronRight, Terminal, Palette, Layout, FileCode, Upload, Image, Paperclip
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
  const [verticalPosition, setVerticalPosition] = useState(0);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Particles Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * window.innerHeight],
              x: [null, Math.random() * window.innerWidth],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Navigation - Glassmorphic */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/20 backdrop-blur-2xl"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div 
              className="relative w-11 h-11 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40"
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Wand2 className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl blur-xl opacity-50" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                AI Studio
              </h1>
              <p className="text-[10px] text-white/60 tracking-wider uppercase">Elite Creation Platform</p>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Examples", href: "/examples" },
              { label: "Templates", href: "/templates" }
            ].map((item, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = item.href}
                className="relative px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors group overflow-hidden rounded-xl"
              >
                <span className="relative z-10">{item.label}</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  layoutId="navHover"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      {/* Main Content - Hero Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 pt-40 pb-20">
        <motion.div 
          className="max-w-5xl mx-auto w-full cursor-move"
          drag="y"
          dragConstraints={{ top: -300, bottom: 300 }}
          dragElastic={0.1}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
          onDrag={(_, info) => setVerticalPosition(info.offset.y)}
          whileDrag={{ scale: 0.98 }}
        >
          
          {/* Hero Title with Advanced Typography */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.6, 0.05, 0.01, 0.9] }}
            className="text-center mb-10 space-y-5"
          >
            <div className="relative inline-block">
              <motion.h1 
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.span 
                  className="block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  Build
                </motion.span>
                <motion.span 
                  className="block bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent"
                  style={{
                    textShadow: "0 0 80px rgba(251, 146, 60, 0.5)"
                  }}
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  Anything
                </motion.span>
              </motion.h1>
              
              {/* Decorative Elements */}
              <motion.div
                className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-3xl opacity-40"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed"
            >
              Transform your vision into{" "}
              <span className="font-semibold text-amber-400">production-ready code</span>
              {" "}with the power of AI
            </motion.p>

          </motion.div>

          {/* Elite Input Area */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="relative max-w-3xl mx-auto"
          >
            {/* Ambient Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-[3rem] blur-3xl" />
            <motion.div 
              className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-[2.5rem] opacity-0"
              whileHover={{ opacity: 0.1 }}
              transition={{ duration: 0.3 }}
            />
            
            {/* Main Input Container */}
            <div className="relative bg-white/98 backdrop-blur-3xl rounded-[2rem] shadow-[0_20px_80px_rgba(0,0,0,0.3)] border border-white/40 overflow-hidden">
              
              {/* Input Field */}
              <div className="relative p-2">
                <Textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your vision... e.g., 'A sleek portfolio with 3D animations and dark mode'"
                  className="min-h-[120px] bg-transparent border-0 px-6 py-4 pr-20 text-slate-900 placeholder-slate-400 focus:outline-none resize-none text-base leading-relaxed font-light"
                  disabled={isGenerating}
                />
                
                {/* Floating Generate Button */}
                <motion.button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  whileTap={{ scale: 0.92 }}
                  className="absolute bottom-6 right-6 p-4 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white rounded-2xl shadow-2xl shadow-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed group"
                  title="Generate with AI"
                >
                  <motion.div
                    animate={isGenerating ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isGenerating ? Infinity : 0, ease: "linear" }}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    )}
                  </motion.div>
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                </motion.button>
              </div>
              
              {/* Advanced Toolbar */}
              <div className="border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 via-amber-50/50 to-orange-50/80 px-6 py-4">
                <div className="flex items-center justify-between">
                  
                  {/* Left: Upload Options */}
                  <div className="flex items-center gap-2">
                    {[
                      { icon: Image, label: "Image", accept: "image/*" },
                      { icon: Paperclip, label: "File", accept: "*" },
                      { icon: Layout, label: "Template", onClick: () => window.location.href = "/templates" }
                    ].map((item, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (item.onClick) {
                            item.onClick();
                          } else {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = item.accept;
                            input.onchange = () => toast.success(`${item.label} upload coming soon!`);
                            input.click();
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/90 rounded-xl transition-all border border-slate-200/50 group"
                      >
                        <item.icon className="w-4 h-4 text-amber-600 group-hover:text-amber-700 transition-colors" />
                        <span className="text-xs font-medium text-slate-700">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Right: Keyboard Shortcut */}
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/5 rounded-lg">
                      <kbd className="px-2 py-0.5 bg-white rounded text-xs font-mono text-slate-600 shadow-sm">⏎</kbd>
                      <span className="text-xs text-slate-500">to generate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-slate-500 font-medium">AI Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
