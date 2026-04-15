import { useState, useEffect } from "react";
import { Brain, Play, Trash2, RefreshCw, Plus, Loader2, CheckCircle2, XCircle, Clock, Circle, ChevronDown, ChevronRight, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Agent } from "@/types/agent";
import { getAgents, deleteAgent, runAgent } from "@/lib/agentStore";
import { useNavigate } from "react-router-dom";

const STATUS_CONFIG = {
  idle: { label: "Idle", icon: Circle, color: "text-black/30", bg: "bg-black/6" },
  running: { label: "Running", icon: Loader2, color: "text-primary", bg: "bg-primary/10", spin: true },
  completed: { label: "Done", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
};

function AgentCard({ agent, onDelete, onRun, running }: {
  agent: Agent;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
  running: boolean;
}) {
  const [logsOpen, setLogsOpen] = useState(false);
  const cfg = STATUS_CONFIG[agent.status];
  const Icon = cfg.icon;

  return (
    <Card className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/8">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-black">{agent.name}</h3>
            <p className="text-[11px] font-mono text-black/35 mt-0.5">{agent.id}</p>
          </div>
        </div>
        <span className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
          <Icon className={cn("h-3 w-3", cfg.spin && "animate-spin")} />
          {cfg.label}
        </span>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-black/30">Role</p>
        <p className="text-xs text-black/60 leading-relaxed line-clamp-3">{agent.role}</p>
      </div>

      <div className="flex items-center justify-between text-[10px] text-black/35">
        <span className="font-mono bg-black/4 px-2 py-0.5 rounded">{agent.model}</span>
        <span>{new Date(agent.updatedAt).toLocaleString()}</span>
      </div>

      {agent.result && (
        <div className="rounded-lg bg-green-50 border border-green-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600 mb-1">Last Result</p>
          <p className="text-xs text-black/60 leading-relaxed line-clamp-4">{agent.result}</p>
        </div>
      )}

      {/* Logs toggle */}
      {agent.logs.length > 0 && (
        <div>
          <button
            onClick={() => setLogsOpen((o) => !o)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-black/30 hover:text-primary transition-colors"
          >
            {logsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            Logs ({agent.logs.length})
          </button>
          {logsOpen && (
            <div className="mt-2 bg-black/3 rounded-lg p-2.5 max-h-32 overflow-y-auto space-y-0.5 border border-black/5">
              {agent.logs.map((log, i) => (
                <p key={i} className="text-[10px] font-mono text-black/50 leading-relaxed">{log}</p>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1 border-t border-black/5">
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 h-8 text-xs hover:bg-primary/8 hover:text-primary"
          disabled={running || agent.status === "running"}
          onClick={() => onRun(agent.id)}
        >
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Play className="h-3.5 w-3.5 mr-1.5" />}
          Run
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-500"
          onClick={() => onDelete(agent.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("Summarize the latest trends in AI agents");
  const navigate = useNavigate();

  const refresh = () => setAgents(getAgents());

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    deleteAgent(id);
    refresh();
  };

  const handleRun = async (id: string) => {
    const apiKey = sessionStorage.getItem("groq_api_key");
    if (!apiKey) {
      alert("Set your Groq API key in the Chat page first.");
      return;
    }
    setRunningId(id);
    try {
      await runAgent(id, taskInput, apiKey, import.meta.env.VITE_API_URL || "");
    } catch { /* error logged in agent */ }
    refresh();
    setRunningId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Agents</h1>
          <p className="text-sm text-black/45 mt-0.5">Manage and run your AI agents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs border-black/12" onClick={refresh}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
          </Button>
          <Button
            size="sm"
            className="bg-gradient-hero hover:opacity-90 text-white shadow-sm shadow-primary/20 text-xs"
            onClick={() => navigate("/chat")}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />Create via Chat
          </Button>
        </div>
      </div>

      {/* Quick run task input */}
      {agents.length > 0 && (
        <Card className="p-4 bg-white border border-black/8 animate-fade-in-up">
          <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-2">Quick Run Task</p>
          <div className="flex gap-2">
            <input
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Task to run on selected agent..."
              className="flex-1 text-sm border border-black/10 rounded-lg px-3 py-2 outline-none focus:border-primary/40 text-black placeholder:text-black/30"
            />
          </div>
          <p className="text-[10px] text-black/30 mt-1.5">Click "Run" on any agent card to execute this task</p>
        </Card>
      )}

      {agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-black/4">
            <Brain className="h-10 w-10 text-black/20" />
          </div>
          <div className="text-center">
            <h3 className="text-sm font-bold text-black/50">No agents yet</h3>
            <p className="text-xs text-black/35 mt-1">Go to Chat and ask the AI to create agents for you</p>
          </div>
          <Button
            size="sm"
            className="bg-gradient-hero hover:opacity-90 text-white shadow-sm shadow-primary/20 text-xs mt-2"
            onClick={() => navigate("/chat")}
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />Open Chat
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent, i) => (
            <div key={agent.id} style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}>
              <AgentCard
                agent={agent}
                onDelete={handleDelete}
                onRun={handleRun}
                running={runningId === agent.id}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
