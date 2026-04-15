import { Code2, Sparkles, Bug, Zap, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const CodeStudio = () => {
  const [code, setCode] = useState(`// Express.js User Profile API
const express = require('express');
const router = express.Router();

// GET user profile
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create user
router.post('/api/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.status(201).json(user);
});`);

  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleAction = async (action: string) => {
    const apiKey = sessionStorage.getItem("groq_api_key");
    if (!apiKey) {
      alert("Please set your Groq API key in the chat first (/key gsk_...)");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const prompt = `${action} this code:\n\n${code}`;

      const resp = await fetch(`${apiUrl}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: prompt,
          api_key: apiKey,
          model: "llama-3.3-70b-versatile",
          options: {}
        }),
      });

      const data = await resp.json();
      if (data.result) {
        setSuggestion(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { icon: Sparkles, label: "Generate", description: "Create new code", shortcut: "⌘G", action: "Complete or generate more" },
    { icon: Code2, label: "Explain", description: "Understand code", shortcut: "⌘E", action: "Explain" },
    { icon: Bug, label: "Debug", description: "Find issues", shortcut: "⌘D", action: "Debug and fix" },
    { icon: Zap, label: "Optimize", description: "Improve quality", shortcut: "⌘O", action: "Optimize and refactor" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Code Studio</h1>
          <p className="text-sm text-black/45 mt-0.5">AI-powered code assistant</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {/* Editor */}
        <div className="lg:col-span-3 space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms", animationFillMode: "backwards" }}>
          <Card className="bg-white border border-black/8 overflow-hidden hover:shadow-elevated transition-all">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/6 bg-black/2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/40" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                </div>
                <span className="text-xs font-semibold text-black/40 ml-2">main.js</span>
              </div>
              <div className="flex gap-1">
                {actions.map((a) => (
                  <Button
                    key={a.label}
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs hover:bg-primary/8 hover:text-primary text-black/50"
                    onClick={() => handleAction(a.action)}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <a.icon className="h-3 w-3 mr-1" />}
                    {a.label}
                  </Button>
                ))}
              </div>
            </div>
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-[380px] font-mono text-sm border-0 rounded-none resize-none focus-visible:ring-0 leading-relaxed bg-white text-black"
            />
          </Card>

          {suggestion && (
            <Card className="p-4 bg-white border border-primary/20 hover:shadow-glow transition-all animate-scale-in">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">AI Suggestion</p>
                    <button onClick={() => setSuggestion(null)} className="text-black/30 hover:text-black">✕</button>
                  </div>
                  <pre className="text-xs text-black/70 leading-relaxed font-mono bg-black/2 p-3 rounded-lg max-h-60 overflow-y-auto">
                    {suggestion}
                  </pre>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-gradient-hero hover:opacity-90 text-xs shadow-sm shadow-primary/20 text-white active:scale-95 transition-transform"
                      onClick={() => {
                        setCode(suggestion);
                        setSuggestion(null);
                      }}
                    >
                      Replace Code
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-black/10"
                      onClick={() => {
                        setCode(prev => prev + "\n\n" + suggestion);
                        setSuggestion(null);
                      }}
                    >
                      Append Code
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "backwards" }}>
          <Card className="p-4 bg-white border border-black/8 hover:shadow-elevated transition-all">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-3">Actions</h3>
            <div className="space-y-1.5">
              {actions.map((a) => (
                <Button
                  key={a.label}
                  variant="ghost"
                  className="w-full justify-between h-auto p-3 hover:bg-primary/5 hover:text-primary transition-all text-black"
                  onClick={() => handleAction(a.action)}
                  disabled={loading}
                >
                  <div className="flex items-center gap-2.5">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <a.icon className="h-4 w-4 shrink-0" />}
                    <div className="text-left">
                      <p className="text-xs font-bold">{a.label}</p>
                      <p className="text-[10px] text-black/40">{a.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-black/30">{a.shortcut}</span>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-white border border-black/8 hover:shadow-elevated transition-all">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-3">Analysis</h3>
            <div className="space-y-2">
              {[
                { label: "Complexity", value: "Low", color: "text-primary" },
                { label: "Issues", value: "2", color: "text-primary/70" },
                { label: "Coverage", value: "0%", color: "text-black/40" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 rounded-lg bg-black/3">
                  <span className="text-xs font-medium text-black/50">{item.label}</span>
                  <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default CodeStudio;
