// Hub Store — S008 MVP
// Separate store for Agent Hub data (keeps appStore clean)
import { create } from 'zustand';
import type { HubMessage, HubAck, HubAgentStatus, HubTab } from '@/types/hub';
import { mockMessages, mockAcks, computeAgentStatuses } from '@/data/hubMockData';

interface HubStore {
  messages: HubMessage[];
  acks: HubAck[];
  agents: HubAgentStatus[];
  activeTab: HubTab;
  filterAgent: string | null;
  filterTopic: string | null;
  filterPriority: string | null;

  // Actions
  setActiveTab: (tab: HubTab) => void;
  setFilterAgent: (agent: string | null) => void;
  setFilterTopic: (topic: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
  loadHubData: () => void;
  ackMessage: (msgId: string, byAgent: string, note: string) => void;

  // Derived
  getPendingAcks: () => HubMessage[];
  getFilteredMessages: () => HubMessage[];
  getAckForMessage: (msgId: string) => HubAck | undefined;
}

export const useHubStore = create<HubStore>()((set, get) => ({
  messages: [],
  acks: [],
  agents: [],
  activeTab: 'messages',
  filterAgent: null,
  filterTopic: null,
  filterPriority: null,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilterAgent: (agent) => set({ filterAgent: agent }),
  setFilterTopic: (topic) => set({ filterTopic: topic }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),

  loadHubData: () => {
    // MVP: load from mock. Future: fetch from API / file system
    const messages = [...mockMessages].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const acks = [...mockAcks];
    const agents = computeAgentStatuses(messages, acks);
    set({ messages, acks, agents });
  },

  ackMessage: (msgId, byAgent, note) => {
    const newAck: HubAck = {
      ts: new Date().toISOString(),
      msg_id: msgId,
      agent_id: byAgent,
      status: 'ACK',
      note,
    };
    set((state) => ({
      acks: [...state.acks, newAck],
      agents: computeAgentStatuses(state.messages, [...state.acks, newAck]),
    }));
  },

  getPendingAcks: () => {
    const { messages, acks } = get();
    const ackedIds = new Set(acks.map(a => a.msg_id));
    return messages.filter(m => m.requires_ack && !ackedIds.has(m.msg_id));
  },

  getFilteredMessages: () => {
    const { messages, filterAgent, filterTopic, filterPriority } = get();
    return messages.filter(m => {
      if (filterAgent && m.from_agent !== filterAgent && m.to_agent !== filterAgent) return false;
      if (filterTopic && m.topic !== filterTopic) return false;
      if (filterPriority && m.priority !== filterPriority) return false;
      return true;
    });
  },

  getAckForMessage: (msgId) => {
    return get().acks.find(a => a.msg_id === msgId);
  },
}));
