export interface Message {
  role: 'user' | 'ai';
  content: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type AgentState = 'idle' | 'listening' | 'thinking' | 'speaking';
