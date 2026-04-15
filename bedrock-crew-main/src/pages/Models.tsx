import { useState, useEffect } from "react";
import { Zap, Brain, Loader2, CheckCircle, XCircle, RefreshCw, Cpu, FlaskConical, Eye, Circle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface GroqModel {
  id: string;
  name: string;
  description: string;
  max_tokens: number;
}

const Models = () => {
  const [models, setModels] = useState<GroqModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingModelId, setTestingModelId] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState("Explain quantum entanglement in one sentence.");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [defaultModel, setDefaultModel] = useState<string>(localStorage.getItem("default_model") || "llama-3.3-70b-versatile");
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/models`);
      const data = await resp.json();
      if (data.models) {
        setModels(data.models);
      }
    } catch (err) {
      setError("Failed to fetch models from API.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleSetDefault = (id: string) => {
    setDefaultModel(id);
    localStorage.setItem("default_model", id);
  };

  const testModel = async (modelId: string) => {
    const apiKey = sessionStorage.getItem("groq_api_key");
    if (!apiKey) {
      setTestResult("❌ No API key set. Please set it via chat (/key command) or env vars.");
      return;
    }

    setTestingModelId(modelId);
    setTestResult(null);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const resp = await fetch(`${apiUrl}/api/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: testPrompt,
          api_key: apiKey,
          model: modelId,
          options: {}
        }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      setTestResult(data.result || "No output");
    } catch (err: unknown) {
      setTestResult(`❌ ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setTestingModelId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 animate-fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-black/40">Loading Groq models...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Model Library</h1>
          <p className="text-sm text-black/45 mt-0.5">Browse and test Groq-powered language models</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs border-black/12 hover:border-primary hover:text-primary transition-all" onClick={fetchModels}>
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isLoading && "animate-spin")} />Refresh
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-destructive/20 bg-destructive/5 text-destructive text-sm font-medium">
          {error}
        </Card>
      )}

      {/* Models Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((model, i) => {
          const isDefault = defaultModel === model.id;
          return (
            <Card
              key={model.id}
              className={cn(
                "p-5 bg-white border transition-all duration-300 group flex flex-col gap-4 animate-fade-in-up hover:shadow-elevated",
                isDefault ? "border-primary/40 shadow-glow" : "border-black/8"
              )}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl transition-colors", isDefault ? "bg-primary/10 text-primary" : "bg-black/4 text-black/30 group-hover:bg-primary/5 group-hover:text-primary/60")}>
                  <Brain className="h-5 w-5" />
                </div>
                <button
                  onClick={() => handleSetDefault(model.id)}
                  className={cn("transition-colors", isDefault ? "text-primary" : "text-black/20 hover:text-primary/60")}
                >
                  {isDefault ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
              </div>

              <div>
                <h3 className="text-sm font-bold text-black group-hover:text-primary transition-colors">{model.name}</h3>
                <p className="text-[11px] font-mono text-black/40 mt-0.5">{model.id}</p>
                <p className="text-xs text-black/60 mt-2 leading-relaxed line-clamp-2 min-h-[2rem]">{model.description}</p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-black/40 uppercase tracking-widest font-bold">Max Tokens</span>
                  <span className="text-xs font-mono font-bold text-black">{model.max_tokens.toLocaleString()}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider hover:bg-primary hover:text-white transition-all"
                  disabled={testingModelId === model.id}
                  onClick={() => testModel(model.id)}
                >
                  {testingModelId === model.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Test"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Test Panel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-4">Test Playground</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2 block">Prompt</Label>
              <Input
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Enter a prompt to test..."
                className="text-sm border-black/12 focus-visible:ring-primary/30 text-black h-10"
              />
            </div>
            <div className="p-3 rounded-xl border border-primary/20 bg-primary/5">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="h-3 w-3" /> Note
              </p>
              <p className="text-[11px] text-black/50 mt-1">Tests require a Groq API key to be set in the current session. Use the chat bar to set it via <code>/key</code>.</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40">Result</h3>
            {testResult && (
              <button
                onClick={() => setTestResult(null)}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex-1 bg-black/3 rounded-xl p-4 border border-black/5 min-h-[120px]">
            {testResult ? (
              <pre className="text-xs whitespace-pre-wrap font-mono text-black leading-relaxed">{testResult}</pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-black/20 gap-2">
                <Sparkles className="h-6 w-6" />
                <p className="text-[11px] font-medium italic">Output will appear here after testing a model</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Models;
