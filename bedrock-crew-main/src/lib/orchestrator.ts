import { ToolCall } from "@/types/agent";
import { createAgent, deleteAgent, getAgents, runAgent, updateAgentStatus } from "./agentStore";

export interface OrchestratorTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const AGENT_TOOLS: OrchestratorTool[] = [
  {
    type: "function",
    function: {
      name: "create_agent",
      description: "Create a new AI agent with a specific role and model. Use this when the user wants to create an agent.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "A short descriptive name for the agent (e.g. 'Researcher', 'Coder')" },
          role: { type: "string", description: "The agent's role and responsibilities in detail" },
          model: {
            type: "string",
            description: "The model ID to use",
            enum: ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
          },
        },
        required: ["name", "role", "model"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_agent",
      description: "Run an existing agent on a specific task. Returns the agent's output.",
      parameters: {
        type: "object",
        properties: {
          agent_id: { type: "string", description: "The ID of the agent to run" },
          task: { type: "string", description: "The task or prompt to give the agent" },
        },
        required: ["agent_id", "task"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_agents",
      description: "List all existing agents and their current status.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_agent",
      description: "Delete an agent by ID.",
      parameters: {
        type: "object",
        properties: {
          agent_id: { type: "string", description: "The ID of the agent to delete" },
        },
        required: ["agent_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "run_pipeline",
      description: "Run multiple agents in sequence on a task, passing each agent's output to the next. Use for complex multi-step workflows.",
      parameters: {
        type: "object",
        properties: {
          agent_ids: {
            type: "array",
            items: { type: "string" },
            description: "Ordered list of agent IDs to run in sequence",
          },
          initial_task: { type: "string", description: "The initial task/input for the first agent" },
        },
        required: ["agent_ids", "initial_task"],
      },
    },
  },
];

export async function executeTool(
  toolCall: ToolCall,
  apiKey: string,
  apiUrl: string,
  onAgentsChange?: () => void
): Promise<string> {
  const { name, arguments: args } = toolCall;

  switch (name) {
    case "create_agent": {
      const agent = createAgent(
        args.name as string,
        args.role as string,
        args.model as string
      );
      onAgentsChange?.();
      return JSON.stringify({
        success: true,
        agent_id: agent.id,
        message: `Agent "${agent.name}" created successfully with ID: ${agent.id}`,
        agent,
      });
    }

    case "run_agent": {
      try {
        const result = await runAgent(args.agent_id as string, args.task as string, apiKey, apiUrl);
        onAgentsChange?.();
        return JSON.stringify({ success: true, result, agent_id: args.agent_id });
      } catch (err) {
        onAgentsChange?.();
        return JSON.stringify({ success: false, error: err instanceof Error ? err.message : String(err) });
      }
    }

    case "list_agents": {
      const agents = getAgents();
      if (agents.length === 0) return JSON.stringify({ agents: [], message: "No agents exist yet." });
      return JSON.stringify({
        agents: agents.map((a) => ({
          id: a.id,
          name: a.name,
          role: a.role,
          model: a.model,
          status: a.status,
          result_preview: a.result ? a.result.slice(0, 200) + (a.result.length > 200 ? "..." : "") : null,
        })),
      });
    }

    case "delete_agent": {
      const ok = deleteAgent(args.agent_id as string);
      onAgentsChange?.();
      return JSON.stringify({
        success: ok,
        message: ok ? `Agent ${args.agent_id} deleted.` : "Agent not found.",
      });
    }

    case "run_pipeline": {
      const agentIds = args.agent_ids as string[];
      let currentInput = args.initial_task as string;
      const results: Array<{ agent_id: string; output: string }> = [];

      for (const agentId of agentIds) {
        try {
          const output = await runAgent(agentId, currentInput, apiKey, apiUrl);
          results.push({ agent_id: agentId, output });
          currentInput = output; // chain output to next agent
          onAgentsChange?.();
        } catch (err) {
          onAgentsChange?.();
          return JSON.stringify({
            success: false,
            error: `Pipeline failed at agent ${agentId}: ${err instanceof Error ? err.message : String(err)}`,
            partial_results: results,
          });
        }
      }

      return JSON.stringify({ success: true, pipeline_results: results, final_output: currentInput });
    }

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
