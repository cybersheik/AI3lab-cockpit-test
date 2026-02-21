// AgentHubPanel — S008 MVP
// Panel 2 (Comms) — 3 tabs: Messages, Pending ACK, Agents
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Bell, Users, RefreshCw, Filter, X } from 'lucide-react';
import { useHubStore } from '@/store/hubStore';
import { AGENT_IDS } from '@/data/hubMockData';
import { MessageFeed } from './MessageFeed';
import { AgentRegistry } from './AgentRegistry';
import { cn } from '@/lib/utils';
import type { HubTab } from '@/types/hub';

const tabs: { id: HubTab; label: string; icon: typeof MessageSquare }[] = [
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'pending', label: 'Pending ACK', icon: Bell },
  { id: 'agents', label: 'Agents', icon: Users },
];

export function AgentHubPanel() {
  const {
    activeTab, setActiveTab,
    loadHubData,
    getPendingAcks,
    filterAgent, setFilterAgent,
    filterTopic, setFilterTopic,
  } = useHubStore();

  useEffect(() => {
    loadHubData();
  }, [loadHubData]);

  const pendingCount = getPendingAcks().length;

  const topics = [...new Set(useHubStore.getState().messages.map(m => m.topic))];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-white/[0.06]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const badge = tab.id === 'pending' ? pendingCount : 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all relative',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
              )}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-amber-500 text-black rounded-full px-1">
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Refresh */}
        <button
          onClick={loadHubData}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          title="Refresh"
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Filters (messages tab only) */}
      {activeTab === 'messages' && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
          <Filter size={11} className="text-white/25 shrink-0" />

          {/* Agent filter */}
          <select
            value={filterAgent || ''}
            onChange={e => setFilterAgent(e.target.value || null)}
            className="bg-white/[0.04] border border-white/[0.08] rounded text-[10px] text-white/60 px-2 py-1 appearance-none cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            <option value="">All agents</option>
            {AGENT_IDS.map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>

          {/* Topic filter */}
          <select
            value={filterTopic || ''}
            onChange={e => setFilterTopic(e.target.value || null)}
            className="bg-white/[0.04] border border-white/[0.08] rounded text-[10px] text-white/60 px-2 py-1 appearance-none cursor-pointer hover:bg-white/[0.06] transition-colors"
          >
            <option value="">All topics</option>
            {topics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Clear filters */}
          {(filterAgent || filterTopic) && (
            <button
              onClick={() => { setFilterAgent(null); setFilterTopic(null); }}
              className="p-1 rounded text-white/30 hover:text-white/60 transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden px-3 py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {activeTab === 'messages' && <MessageFeed mode="all" />}
            {activeTab === 'pending' && <MessageFeed mode="pending" />}
            {activeTab === 'agents' && <AgentRegistry />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
