// AgentRegistry — S008 MVP
// Shows all agent IDs with computed presence status
import { motion } from 'framer-motion';
import { Circle, MessageSquare, User, Bot } from 'lucide-react';
import { useHubStore } from '@/store/hubStore';
import { AGENT_LABELS } from '@/data/hubMockData';
import { cn } from '@/lib/utils';

const presenceColors = {
  active: 'text-emerald-400',
  idle: 'text-white/30',
  offline: 'text-red-400/50',
};

function timeAgo(iso?: string) {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function isHuman(id: string) {
  return id.startsWith('human-');
}

export function AgentRegistry() {
  const { agents, setFilterAgent, setActiveTab } = useHubStore();

  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/30">
        <Bot size={28} className="mb-2 text-white/20" />
        <span className="text-xs">No agents registered</span>
      </div>
    );
  }

  const handleAgentClick = (agentId: string) => {
    setFilterAgent(agentId);
    setActiveTab('messages');
  };

  return (
    <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[45vh] pr-1 scrollbar-thin">
      {agents.map((agent, i) => (
        <motion.button
          key={agent.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => handleAgentClick(agent.id)}
          className={cn(
            'flex items-start gap-2.5 p-3 rounded-lg border transition-colors text-left',
            'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05]',
            agent.presence === 'active' && 'border-emerald-500/10'
          )}
        >
          {/* Icon */}
          <div className="shrink-0 mt-0.5">
            {isHuman(agent.id) ? (
              <User size={16} className="text-purple-400" />
            ) : (
              <Bot size={16} className="text-cyan-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Circle size={6} className={cn('fill-current', presenceColors[agent.presence])} />
              <span className="text-[11px] text-white/80 font-medium truncate">
                {AGENT_LABELS[agent.id] || agent.id}
              </span>
            </div>
            <div className="text-[10px] text-white/30 font-mono truncate">{agent.id}</div>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="flex items-center gap-1 text-[10px] text-white/40">
                <MessageSquare size={10} />
                {agent.messageCount}
              </span>
              <span className="text-[10px] text-white/25">
                {timeAgo(agent.lastSeen)}
              </span>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
