import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, MessageSquare, Lightbulb, AlertTriangle } from 'lucide-react';
import { useAppStore, agents, iterations } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function AgentPanel() {
  const { selectedAgent, selectAgent, currentIteration } = useAppStore();

  if (!selectedAgent) return null;

  const agent = agents.find(a => a.id === selectedAgent);
  if (!agent) return null;

  // Get iterations where this agent was active
  const agentIterations = iterations.filter(
    i => i.agentContributions[selectedAgent as keyof typeof i.agentContributions] !== 'Low'
  );

  const recentIterations = agentIterations.slice(-5);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed right-4 top-24 bottom-24 w-80 z-40"
      >
        <div 
          className="glass-panel-strong h-full flex flex-col"
          style={{ borderColor: agent.color }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: `${agent.color}30` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: `${agent.color}20`,
                  boxShadow: `0 0 20px ${agent.glowColor}`
                }}
              >
                <Activity size={20} style={{ color: agent.color }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{agent.name}</h3>
                <p 
                  className="text-xs"
                  style={{ color: agent.color }}
                >
                  {agent.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => selectAgent(null)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={18} className="text-white/60" />
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            {/* Description */}
            <div className="mb-6">
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-white/80 text-sm leading-relaxed">
                {agent.description}
              </p>
            </div>

            {/* Status */}
            <div className="mb-6">
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Current Status
              </h4>
              <div 
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ backgroundColor: `${agent.color}15` }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="text-white text-sm capitalize">{agent.status}</span>
              </div>
            </div>

            {/* Contribution Level */}
            <div className="mb-6">
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Current Iteration Contribution
              </h4>
              <div className="flex items-center gap-2">
                {['Low', 'Medium', 'High'].map((level) => {
                  const currentLevel = iterations[currentIteration - 1]?.agentContributions[selectedAgent as keyof typeof iterations[0]['agentContributions']];
                  const isActive = currentLevel === level;
                  return (
                    <div
                      key={level}
                      className={cn(
                        "flex-1 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all",
                        isActive
                          ? "text-white"
                          : "text-white/30 bg-white/5"
                      )}
                      style={isActive ? { backgroundColor: agent.color } : {}}
                    >
                      {level}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="mb-6">
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Recent Activity
              </h4>
              <div className="space-y-2">
                {recentIterations.map((iter) => (
                  <div
                    key={iter.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      iter.id === currentIteration
                        ? "bg-white/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ 
                        backgroundColor: `${agent.color}30`,
                        color: agent.color
                      }}
                    >
                      {iter.id}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm">{iter.name}</div>
                      <div className="text-white/40 text-xs">{iter.description}</div>
                    </div>
                    <div
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${agent.color}20`,
                        color: agent.color
                      }}
                    >
                      {iter.agentContributions[selectedAgent as keyof typeof iter.agentContributions]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div>
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Key Insights
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                  <span className="text-white/70">
                    Generated 12 alternative approaches in Exploration phase
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                  <span className="text-white/70">
                    Identified 3 potential edge cases in current iteration
                  </span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare size={14} className="text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-white/70">
                    Synthesized feedback from 5 previous iterations
                  </span>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div 
            className="p-4 border-t"
            style={{ borderColor: `${agent.color}30` }}
          >
            <button
              className="w-full py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{ 
                backgroundColor: agent.color,
                color: '#fff'
              }}
            >
              Focus on {agent.role}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
