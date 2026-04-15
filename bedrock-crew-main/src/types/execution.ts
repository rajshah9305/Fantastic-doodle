export interface ExecutionEntry {
  id: number;
  input: string;
  status: 'completed' | 'failed' | 'running' | 'idle';
  timestamp: string;
  result?: {
    intent: string;
    model?: string;
    [key: string]: string | number | boolean | undefined | null | object;
  };
}
