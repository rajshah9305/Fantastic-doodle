import { History as HistoryIcon, Search, Trash2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ExecutionEntry } from "@/types/execution";

const History = () => {
  const [history, setHistory] = useState<ExecutionEntry[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("execution_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your execution history?")) {
      localStorage.removeItem("execution_history");
      setHistory([]);
    }
  };

  const filteredHistory = history.filter(h =>
    h.input.toLowerCase().includes(search.toLowerCase()) ||
    (h.result?.intent?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black">Execution History</h1>
          <p className="text-sm text-black/45 mt-0.5">Track and manage past pipeline executions</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs border-destructive/12 hover:border-destructive hover:bg-destructive/5 hover:text-destructive text-black/50 transition-all"
          onClick={clearHistory}
        >
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />Clear History
        </Button>
      </div>

      <div className="relative animate-fade-in-up">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search executions..."
          className="pl-10 text-sm border-black/8 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-3">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((h, i) => (
            <Card
              key={h.id}
              className="p-4 bg-white border border-black/8 hover:shadow-elevated transition-all group animate-fade-in-up"
              style={{ animationDelay: `${i * 40}ms`, animationFillMode: "backwards" }}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5",
                  h.status === "completed" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}>
                  {h.status === "completed" ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/30">Execution #{h.id.toString().slice(-4)}</span>
                      <span className="text-black/10">·</span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                        h.status === "completed" ? "text-primary" : "text-destructive"
                      )}>
                        {h.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-black/40 font-medium">
                      <Clock className="h-3 w-3" />
                      {new Date(h.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-black font-medium leading-relaxed truncate group-hover:text-primary transition-colors">{h.input}</p>
                  {h.result && (
                    <div className="flex items-center gap-3 mt-2 text-[10px] font-bold uppercase tracking-widest text-black/30">
                      <span>Intent: {h.result.intent}</span>
                      <span>·</span>
                      <span>Model: {h.result.model || "Groq"}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-black/20 gap-3">
            <HistoryIcon className="h-8 w-8" />
            <p className="text-xs font-medium italic">No execution history matching your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
