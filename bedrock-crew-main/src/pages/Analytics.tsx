import { BarChart3, TrendingUp, Clock, Target, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { ExecutionEntry } from "@/types/execution";

const Analytics = () => {
  const [history, setHistory] = useState<ExecutionEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("execution_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const total = history.length;
  const completed = history.filter(h => h.status === "completed").length;
  const failed = history.filter(h => h.status === "failed").length;

  const metrics = [
    { label: "Total Executions", value: total.toString(), icon: BarChart3, trend: "Overall" },
    { label: "Success Rate", value: total > 0 ? `${Math.round((completed / total) * 100)}%` : "100%", icon: Target, trend: "Performance" },
    { label: "Avg Latency", value: "1.4s", icon: Clock, trend: "-0.2s" },
    { label: "Failed Tasks", value: failed.toString(), icon: Activity, trend: "Stability" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight text-black">Analytics</h1>
        <p className="text-sm text-black/45 mt-0.5">Deep dive into pipeline performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <Card
            key={metric.label}
            className="p-5 bg-white border border-black/8 hover:shadow-elevated transition-all animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <metric.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{metric.trend}</span>
            </div>
            <p className="text-xs font-semibold text-black/40 uppercase tracking-wider">{metric.label}</p>
            <p className="text-2xl font-extrabold mt-1 text-black tracking-tight">{metric.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-white border border-black/8 hover:shadow-elevated transition-all">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black/40">Execution Distribution</h3>
          <TrendingUp className="h-4 w-4 text-primary" />
        </div>

        <div className="space-y-4">
          {[
            { label: "Llama 3.3 70B", value: 45, color: "bg-primary" },
            { label: "Mixtral 8x7B", value: 30, color: "bg-primary/70" },
            { label: "Gemma 2 9B", value: 15, color: "bg-primary/40" },
            { label: "Others", value: 10, color: "bg-primary/20" },
          ].map((item) => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                <span className="text-black/60">{item.label}</span>
                <span className="text-black">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/3 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
