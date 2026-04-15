import { Brain, Zap, Target, TrendingUp, ArrowUpRight, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ExecutionEntry } from "@/types/execution";

const Dashboard = () => {
  const [history, setHistory] = useState<ExecutionEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("execution_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const tasksCompleted = history.filter(h => h.status === "completed").length;
  const successRate = history.length > 0
    ? Math.round((tasksCompleted / history.length) * 100)
    : 100;

  const stats = [
    { label: "Active Agents", value: "4", icon: Brain, change: "+0" },
    { label: "Tasks Completed", value: tasksCompleted.toString(), icon: Target, change: `+${tasksCompleted}` },
    { label: "Avg Response", value: "1.8s", icon: Zap, change: "-0.5s" },
    { label: "Success Rate", value: `${successRate}%`, icon: TrendingUp, change: "+0%" },
  ];

  const agents = [
    { name: "Planner", status: "active", tasks: Math.floor(tasksCompleted * 0.25) },
    { name: "Researcher", status: "active", tasks: Math.floor(tasksCompleted * 0.2) },
    { name: "Coder", status: "active", tasks: Math.floor(tasksCompleted * 0.35) },
    { name: "Reviewer", status: "idle", tasks: Math.floor(tasksCompleted * 0.2) },
  ];

  const recentTasks = history.slice(0, 4).map((h, i) => ({
    id: h.id || i,
    task: h.input,
    status: h.status,
    agent: ["Coder", "Researcher", "Planner", "Reviewer"][i % 4],
    time: new Date(h.timestamp).toLocaleTimeString()
  }));

  const displayTasks = recentTasks.length > 0 ? recentTasks : [
    { id: 1, task: "No tasks executed yet", status: "idle", agent: "N/A", time: "Now" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Dashboard</h1>
          <p className="text-sm text-black/45 mt-0.5">Monitor your AI pipeline performance</p>
        </div>
        <Button className="bg-gradient-hero hover:opacity-90 shadow-sm shadow-primary/20 transition-all text-white">
          <Zap className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className="group relative overflow-hidden p-5 bg-white border border-black/8 hover:shadow-elevated transition-all duration-300 animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-extrabold mt-1.5 tracking-tight text-black">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="h-3 w-3 text-primary" />
                  <span className="text-xs font-bold text-primary">{stat.change}</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/4 group-hover:bg-primary/10 transition-colors">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-hero opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card
          className="lg:col-span-2 p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
          style={{ animationDelay: "320ms", animationFillMode: "backwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40">Active Agents</h3>
            <Activity className="h-4 w-4 text-black/30" />
          </div>
          <div className="space-y-2.5">
            {agents.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between p-3 rounded-xl bg-black/3 hover:bg-black/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full bg-primary ${agent.status === "active" ? "animate-pulse shadow-sm shadow-primary/40" : "opacity-25"}`} />
                  <div>
                    <span className="text-sm font-semibold text-black">{agent.name}</span>
                    <span className="text-xs text-black/40 ml-2">{agent.tasks} tasks</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  agent.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-black/6 text-black/40"
                }`}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          className="lg:col-span-3 p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
          style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black/40">Recent Tasks</h3>
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary font-semibold">View All</Button>
          </div>
          <div className="space-y-2">
            {displayTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/3 transition-colors cursor-pointer group">
                <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                  task.status === "completed" ? "bg-primary" : "bg-primary/40"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-black group-hover:text-primary transition-colors">{task.task}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-black/40 uppercase">{task.agent}</span>
                    <span className="text-black/20">·</span>
                    <span className="text-[10px] text-black/40">{task.time}</span>
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  task.status === "completed"
                    ? "bg-primary/10 text-primary"
                    : "bg-primary/6 text-primary/70"
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
