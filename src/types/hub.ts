// Agent Hub Types — S008 MVP
// Data contract per IMPLEMENTATION_CONTRACT_LD.md

export type HubPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type HubAckStatus = 'RECEIVED' | 'ACK' | 'REJECTED' | 'PENDING';
export type HubAgentPresence = 'active' | 'idle' | 'offline';

export interface HubMessage {
  msg_id: string;
  created_at: string;
  from_agent: string;
  to_agent: string;
  topic: string;
  priority: HubPriority;
  requires_ack: boolean;
  body: string;
  payload_path?: string;
}

export interface HubAck {
  ts: string;
  msg_id: string;
  agent_id: string;
  status: HubAckStatus;
  note: string;
}

export interface HubAgentStatus {
  id: string;
  presence: HubAgentPresence;
  lastSeen?: string;
  messageCount: number;
}

export type HubTab = 'messages' | 'pending' | 'agents';
