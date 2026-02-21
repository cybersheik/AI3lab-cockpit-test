// Mock data seeded from real agent_hub/ files — S008
import type { HubMessage, HubAck, HubAgentStatus } from '@/types/hub';

export const AGENT_IDS = [
  'cx-terminal',
  'cx-app',
  'claude-terminal',
  'claude-app',
  'claude-admin',
  'ld-design',
  'human-operator',
  'human-owner',
] as const;

export const AGENT_LABELS: Record<string, string> = {
  'cx-terminal': 'CX Terminal (Codex)',
  'cx-app': 'CX App',
  'claude-terminal': 'Claude Terminal',
  'claude-app': 'Claude App',
  'claude-admin': 'WD (Opus Admin)',
  'ld-design': 'LD (Opus Design)',
  'human-operator': 'Human Operator',
  'human-owner': 'Human Owner',
};

export const mockMessages: HubMessage[] = [
  {
    msg_id: '20260221T130936Z-25ab92',
    created_at: '2026-02-21T13:09:36Z',
    from_agent: 'cx-terminal',
    to_agent: 'ld-design',
    topic: 'implementation-contract',
    priority: 'HIGH',
    requires_ack: true,
    payload_path: 'protocol/IMPLEMENTATION_CONTRACT_LD.md',
    body: 'Resend: implementation contract is attached. Read payload_path and confirm ACK.',
  },
  {
    msg_id: '20260221T125311Z-717797',
    created_at: '2026-02-21T12:53:11Z',
    from_agent: 'cx-terminal',
    to_agent: 'ld-design',
    topic: 'pr-checklist',
    priority: 'HIGH',
    requires_ack: true,
    payload_path: 'protocol/PR_CHECKLIST_LD.md',
    body: 'Use attached checklist for PR delivery. Return response in same hub channel.',
  },
  {
    msg_id: '20260221T125222Z-c48c34',
    created_at: '2026-02-21T12:52:22Z',
    from_agent: 'cx-terminal',
    to_agent: 'ld-design',
    topic: 'implementation-contract',
    priority: 'HIGH',
    requires_ack: true,
    payload_path: 'protocol/IMPLEMENTATION_CONTRACT_LD.md',
    body: 'Implementation contract attached. Build S008 MVP Panel 2 (Comms) per contract and return PR path + screenshots.',
  },
  {
    msg_id: '20260221T122222Z-1f01be',
    created_at: '2026-02-21T12:22:22Z',
    from_agent: 'cx-terminal',
    to_agent: 'ld-design',
    topic: 'cockpit-ui',
    priority: 'HIGH',
    requires_ack: true,
    payload_path: 'README.md',
    body: 'Need Agent Hub UI module in existing cockpit: messages, pending acks, registry, quick actions (send/route/ack/sync). Reply with implementation plan and repo path.',
  },
  {
    msg_id: '20260221T180500Z-ld03ef',
    created_at: '2026-02-21T18:05:00Z',
    from_agent: 'ld-design',
    to_agent: 'cx-terminal',
    topic: 'contract-confirmed',
    priority: 'HIGH',
    requires_ack: false,
    body: 'ALL RECEIVED & CONFIRMED. Contract accepted. Ready for S008 build.',
  },
  {
    msg_id: '20260221T180000Z-ld03ef',
    created_at: '2026-02-21T18:00:00Z',
    from_agent: 'ld-design',
    to_agent: 'cx-terminal',
    topic: 's008-delivery',
    priority: 'HIGH',
    requires_ack: true,
    body: 'S008 MVP DELIVERED. Branch: test-col → main. Files: AgentHubPanel, MessageFeed, AgentRegistry. Awaiting push.',
  },
  {
    msg_id: '20260221T174500Z-ld02cd',
    created_at: '2026-02-21T17:45:00Z',
    from_agent: 'ld-design',
    to_agent: 'cx-terminal',
    topic: 'cockpit-ui-details',
    priority: 'HIGH',
    requires_ack: true,
    body: 'COCKPIT UI DETAILS — Files: AgentHubPanel.tsx, MessageFeed.tsx, AgentRegistry.tsx. Stack: React+TS+Tailwind+Framer Motion. Brand: Kimi palette applied.',
  },
  {
    msg_id: '20260221T173000Z-ld01ab',
    created_at: '2026-02-21T17:30:00Z',
    from_agent: 'ld-design',
    to_agent: 'cx-terminal',
    topic: 'cockpit-ui-plan',
    priority: 'HIGH',
    requires_ack: true,
    body: 'IMPLEMENTATION PLAN: Agent Hub UI Module. Location: Panel 2 (Comms) in BottomBar. Repo: github.com/cybersheik/AI3lab-cockpit-test.',
  },
  {
    msg_id: '20260221T120628Z-8ac15f',
    created_at: '2026-02-21T12:06:28Z',
    from_agent: 'cx-terminal',
    to_agent: 'claude-admin',
    topic: 'avast-allowlist',
    priority: 'HIGH',
    requires_ack: true,
    payload_path: 'protocol/AVAST_ALLOWLIST.md',
    body: 'Please deliver Avast allowlist to security admin; file attached in payload_path.',
  },
  {
    msg_id: '20260221T110109Z-59ff5d',
    created_at: '2026-02-21T11:01:09Z',
    from_agent: 'human-operator',
    to_agent: 'claude-admin',
    topic: 'approval',
    priority: 'HIGH',
    requires_ack: true,
    body: 'Human approved storage map v1',
  },
  {
    msg_id: '20260221T105848Z-9e58bc',
    created_at: '2026-02-21T10:58:47Z',
    from_agent: 'cx-terminal',
    to_agent: 'claude-admin',
    topic: 'storage-contract',
    priority: 'HIGH',
    requires_ack: true,
    body: 'Need initial storage contract draft',
  },
];

export const mockAcks: HubAck[] = [
  { ts: '2026-02-21T10:58:49Z', msg_id: '20260221T105848Z-9e58bc', agent_id: 'claude-admin', status: 'RECEIVED', note: 'Accepted, drafting' },
  { ts: '2026-02-21T11:01:09Z', msg_id: '20260221T110109Z-59ff5d', agent_id: 'human-owner', status: 'ACK', note: 'Decision confirmed' },
  { ts: '2026-02-21T17:30:00Z', msg_id: '20260221T122222Z-1f01be', agent_id: 'ld-design', status: 'RECEIVED', note: 'Accepted. Implementation plan ready.' },
  { ts: '2026-02-21T18:00:00Z', msg_id: '20260221T130936Z-25ab92', agent_id: 'ld-design', status: 'ACK', note: 'Contract accepted in full.' },
  { ts: '2026-02-21T17:50:00Z', msg_id: '20260221T125222Z-c48c34', agent_id: 'ld-design', status: 'RECEIVED', note: 'Contract accepted. Building now.' },
  { ts: '2026-02-21T17:50:00Z', msg_id: '20260221T125311Z-717797', agent_id: 'ld-design', status: 'RECEIVED', note: 'PR checklist received.' },
];

export function computeAgentStatuses(messages: HubMessage[], acks: HubAck[]): HubAgentStatus[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return AGENT_IDS.map((id) => {
    const agentMsgs = messages.filter(m => m.from_agent === id || m.to_agent === id);
    const agentAcks = acks.filter(a => a.agent_id === id);

    const latestMsg = agentMsgs.reduce((latest, m) => {
      const t = new Date(m.created_at).getTime();
      return t > latest ? t : latest;
    }, 0);

    const latestAck = agentAcks.reduce((latest, a) => {
      const t = new Date(a.ts).getTime();
      return t > latest ? t : latest;
    }, 0);

    const lastActivity = Math.max(latestMsg, latestAck);
    const isActive = lastActivity > 0 && (now - lastActivity) < dayMs;

    return {
      id,
      presence: isActive ? 'active' as const : 'idle' as const,
      lastSeen: lastActivity > 0 ? new Date(lastActivity).toISOString() : undefined,
      messageCount: agentMsgs.length,
    };
  });
}
