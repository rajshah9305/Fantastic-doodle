import { ArrowRight, CheckCircle2, Clock, Play, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ExecutionEntry } from "@/types/execution";

const Pipeline = () => {
  const [lastExecution, setLastExecution] = useState<ExecutionEntry | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("execution_history");
    if (saved) {
      const history: ExecutionEntry[] = JSON.parse(saved);
      if (history.length > 0) {
        setLastExecution(history[0]);
      }
    }
  }, []);

  const steps = [
    { id: 1, name: "Planner", status: lastExecution?.status === "completed" ? "completed" : (lastExecution?.status === "running" ? "active" : "pending"), description: "Task breakdown & strategy" },
    { id: 2, name: "Researcher", status: lastExecution?.status === "completed" ? "completed" : (lastExecution?.status === "running" ? "active" : "pending"), description: "Context gathering & analysis" },
    { id: 3, name: "Coder", status: lastExecution?.status === "completed" ? "completed" : "pending", description: "Code generation & implementation" },
    { id: 4, name: "Reviewer", status: lastExecution?.status === "completed" ? "completed" : "pending", description: "Testing & optimization" },
  ];

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-8 w-8 text-primary" />;
    if (status === "active") return <Clock className="h-8 w-8 text-primary animate-pulse" />;
    return <Circle className="h-8 w-8 text-black/20" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Pipeline Flow</h1>
          <p className="text-sm text-black/45 mt-0.5">Visual agent orchestration and execution</p>
        </div>
        <Button className="bg-gradient-hero hover:opacity-90 shadow-sm shadow-primary/20 text-white">
          <Play className="mr-2 h-4 w-4" />
          Run Pipeline
        </Button>
      </div>

      <Card
        className="p-8 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
        style={{ animationDelay: "100ms", animationFillMode: "backwards" }}
      >
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-3 flex-1">
                <div className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                  step.status === "completed"
                    ? "border-primary bg-primary/8 shadow-sm"
                    : step.status === "active"
                    ? "border-primary bg-primary/5 animate-pulse-glow"
                    : "border-black/10 bg-black/3"
                }`}>
                  {statusIcon(step.status)}
                  {step.status === "active" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse border-2 border-white" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-black">{step.name}</p>
                  <p className="text-[10px] text-black/40 mt-0.5 max-w-[100px]">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center mx-2">
                  <div className={`h-0.5 w-12 rounded transition-colors ${
                    step.status === "completed" ? "bg-primary" : "bg-black/10"
                  }`} />
                  <ArrowRight className={`h-4 w-4 shrink-0 ${
                    step.status === "completed" ? "text-primary" : "text-black/20"
                  }`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card
          className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-4">Last Execution</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-black/3 border border-primary/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Task Input</span>
                <span className="text-[10px] font-mono text-black/40 bg-black/5 px-2 py-0.5 rounded-md">
                  {lastExecution ? new Date(lastExecution.timestamp).toLocaleTimeString() : "N/A"}
                </span>
              </div>
              <p className="text-sm text-black/70 leading-relaxed">
                {lastExecution ? `"${lastExecution.input}"` : "No execution history available."}
              </p>
            </div>
            {lastExecution && (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-black">Status: {lastExecution.status}</span>
                </div>
                {lastExecution.result && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary/3 border border-primary/8">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    <span className="text-xs font-medium text-black/70">Intent: {lastExecution.result.intent}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card
          className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
          style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-4">Agent Logs</h3>
          <div className="space-y-0.5 font-mono text-[11px] bg-black/3 p-3 rounded-xl h-56 overflow-y-auto border border-black/6">
            {lastExecution ? (
              <>
                <p className="text-primary/80">[PLANNER] Analyzing task requirements...</p>
                <p className="text-primary/80">[PLANNER] Breaking down: Auth, CRUD, Validation, Tests</p>
                <p className="text-primary font-semibold">[PLANNER] ✓ Planning complete</p>
                <p className="text-primary/60">[RESEARCHER] Searching best practices...</p>
                <p className="text-primary/60">[RESEARCHER] Found relevant patterns</p>
                <p className="text-primary font-semibold">[RESEARCHER] ✓ Analysis complete</p>
                <p className={lastExecution.status === 'completed' ? 'text-primary font-semibold' : 'text-primary/50 animate-pulse'}>
                  {lastExecution.status === 'completed' ? '✓ Execution complete' : 'Processing...'}
                </p>
              </>
            ) : (
              <p className="text-black/30 italic">No logs available</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Pipeline;
