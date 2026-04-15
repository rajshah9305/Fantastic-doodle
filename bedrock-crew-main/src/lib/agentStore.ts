import { Agent, AgentStatus } from "@/types/agent";

const STORAGE_KEY = "ai_agents";

export function getAgents(): Agent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAgents(agents: Agent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
}

export function createAgent(name: string, role: string, model: string): Agent {
  const agent: Agent = {
    id: `agent_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    role,
    model,
    status: "idle",
    logs: [`[${new Date().toISOString()}] Agent "${name}" created with role: ${role}`],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const agents = getAgents();
  saveAgents([...agents, agent]);
  return agent;
}

export function updateAgentStatus(id: string, status: AgentStatus, log?: string, result?: string): Agent | null {
  const agents = getAgents();
  const idx = agents.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  const updated = {
    ...agents[idx],
    status,
    updatedAt: new Date().toISOString(),
    ...(result !== undefined ? { result } : {}),
    logs: log
      ? [...agents[idx].logs, `[${new Date().toISOString()}] ${log}`]
      : agents[idx].logs,
  };
  agents[idx] = updated;
  saveAgents(agents);
  return updated;
}

export function deleteAgent(id: string): boolean {
  const agents = getAgents();
  const filtered = agents.filter((a) => a.id !== id);
  if (filtered.length === agents.length) return false;
  saveAgents(filtered);
  return true;
}

export function runAgent(id: string, task: string, apiKey: string, apiUrl: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const agents = getAgents();
    const agent = agents.find((a) => a.id === id);
    if (!agent) return reject(new Error("Agent not found"));

    updateAgentStatus(id, "running", `Starting task: ${task}`);

    try {
      const systemPrompt = `You are an AI agent named "${agent.name}" with the role: ${agent.role}. 
Complete the given task thoroughly and return a structured result. Be concise but complete.`;

      const resp = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: task },
          ],
          api_key: apiKey,
          model: agent.model,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error("Agent run failed");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, nl);
          buffer = buffer.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) result += content;
          } catch { /* skip */ }
        }
      }

      updateAgentStatus(id, "completed", `Task completed`, result);
      resolve(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      updateAgentStatus(id, "failed", `Task failed: ${msg}`);
      reject(err);
    }
  });
}
