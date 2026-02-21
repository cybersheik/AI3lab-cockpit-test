// MessageFeed — S008 MVP
// Displays hub messages with ack status badges
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle, ChevronDown } from 'lucide-react';
import { useHubStore } from '@/store/hubStore';
import { AGENT_LABELS } from '@/data/hubMockData';
import type { HubMessage, HubAck } from '@/types/hub';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const priorityColors: Record<string, string> = {
  CRITICAL: 'text-red-400 bg-red-400/10 border-red-400/30',
  HIGH: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  MEDIUM: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  LOW: 'text-white/50 bg-white/5 border-white/10',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function agentName(id: string) {
  return AGENT_LABELS[id] || id;
}

function AckBadge({ ack }: { ack?: HubAck }) {
  if (!ack) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock size={10} /> PENDING
      </span>
    );
  }
  const isAck = ack.status === 'ACK' || ack.status === 'RECEIVED';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border',
      isAck ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
    )}>
      {isAck ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
      {ack.status}
    </span>
  );
}

function MessageCard({ msg, ack, onAck }: { msg: HubMessage; ack?: HubAck; onAck?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const bodyPreview = msg.body.length > 120 ? msg.body.slice(0, 120) + '…' : msg.body;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/[0.06] rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-cyan-400 font-mono truncate">{agentName(msg.from_agent)}</span>
          <span className="text-white/20 text-[10px]">→</span>
          <span className="text-[11px] text-purple-400 font-mono truncate">{agentName(msg.to_agent)}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', priorityColors[msg.priority])}>
            {msg.priority}
          </span>
          <span className="text-[10px] text-white/30 font-mono">{formatTime(msg.created_at)}</span>
        </div>
      </div>

      {/* Topic */}
      <div className="px-3 pb-1">
        <span className="text-[10px] text-white/40 font-mono">#{msg.topic}</span>
      </div>

      {/* Body */}
      <div
        className="px-3 pb-2 cursor-pointer"
        onClick={() => msg.body.length > 120 && setExpanded(!expanded)}
      >
        <p className="text-[12px] text-white/70 leading-relaxed whitespace-pre-wrap">
          {expanded ? msg.body : bodyPreview}
        </p>
        {msg.body.length > 120 && (
          <ChevronDown
            size={12}
            className={cn('text-white/30 mt-1 transition-transform', expanded && 'rotate-180')}
          />
        )}
      </div>

      {/* Footer: ACK status + action */}
      {msg.requires_ack && (
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-white/[0.04]">
          <AckBadge ack={ack} />
          {!ack && onAck && (
            <button
              onClick={onAck}
              className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
            >
              ACK
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function MessageFeed({ mode }: { mode: 'all' | 'pending' }) {
  const { getFilteredMessages, getPendingAcks, getAckForMessage, ackMessage } = useHubStore();
  const messages = mode === 'pending' ? getPendingAcks() : getFilteredMessages();

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-white/30">
        <CheckCircle size={28} className="mb-2 text-emerald-500/40" />
        <span className="text-xs">
          {mode === 'pending' ? 'All messages acknowledged' : 'No messages'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-[45vh] pr-1 scrollbar-thin">
      {messages.map((msg) => (
        <MessageCard
          key={msg.msg_id}
          msg={msg}
          ack={getAckForMessage(msg.msg_id)}
          onAck={
            msg.requires_ack && !getAckForMessage(msg.msg_id)
              ? () => ackMessage(msg.msg_id, 'ld-design', 'Acknowledged from cockpit UI')
              : undefined
          }
        />
      ))}
    </div>
  );
}
