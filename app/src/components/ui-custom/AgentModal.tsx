import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Activity, 
  MessageSquare, 
  Lightbulb, 
  AlertTriangle,
  History,
  BarChart3,
  Settings,
  Zap
} from 'lucide-react';
import { useAppStore, agents, iterations } from '@/store/appStore';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

export function AgentModal() {
  const { selectedAgent, selectAgent, currentIteration, addCommunicationLog } = useAppStore();

  if (!selectedAgent) return null;

  const agent = agents.find(a => a.id === selectedAgent);
  if (!agent) return null;

  // Get iterations where this agent was active
  const agentIterations = iterations.filter(
    i => i.agentContributions[selectedAgent as keyof typeof i.agentContributions] !== 'Low'
  );

  const recentIterations = agentIterations.slice(-5);
  const currentLevel = iterations[currentIteration - 1]?.agentContributions[selectedAgent as keyof typeof iterations[0]['agentContributions']];

  const handleClose = () => selectAgent(null);

  const handleReassign = () => {
    addCommunicationLog('Human', agent.name, 'Role reassignment requested', 'task');
  };

  const handleAdjustPriority = () => {
    addCommunicationLog('Human', agent.name, 'Priority adjustment requested', 'task');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg glass-panel-strong overflow-hidden"
          style={{ borderColor: agent.color }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-5 border-b"
            style={{ borderColor: `${agent.color}30` }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ 
                  backgroundColor: `${agent.color}20`,
                  boxShadow: `0 0 30px ${agent.glowColor}`
                }}
              >
                <Activity size={28} style={{ color: agent.color }} />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">{agent.name}</h2>
                <p 
                  className="text-sm font-medium"
                  style={{ color: agent.color }}
                >
                  {agent.role}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X size={20} className="text-white/60" />
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="max-h-[60vh]">
            <div className="p-5 space-y-5">
              {/* Status & Performance */}
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: `${agent.color}10` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} style={{ color: agent.color }} />
                    <span className="text-white/50 text-xs uppercase tracking-wider">Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                      style={{ backgroundColor: agent.color }}
                    />
                    <span className="text-white font-medium capitalize">{agent.status}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={16} className="text-white/50" />
                    <span className="text-white/50 text-xs uppercase tracking-wider">Performance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: '80%',
                          backgroundColor: agent.color 
                        }}
                      />
                    </div>
                    <span className="text-white text-sm font-medium">80%</span>
                  </div>
                </div>
              </div>

              {/* Current Task */}
              <div className="p-4 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={16} className="text-yellow-400" />
                  <span className="text-white/50 text-xs uppercase tracking-wider">Current Task</span>
                </div>
                <p className="text-white/80 text-sm">
                  "Refine pricing model hypothesis for enterprise clients based on Red Team feedback"
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                  <span>Last output: 2 min ago</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Description</h4>
                <p className="text-white/80 text-sm leading-relaxed">{agent.description}</p>
              </div>

              {/* Contribution Level */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Current Iteration Contribution</h4>
                <div className="flex items-center gap-2">
                  {['Low', 'Medium', 'High'].map((level) => {
                    const isActive = currentLevel === level;
                    return (
                      <div
                        key={level}
                        className={cn(
                          "flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
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
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <History size={14} />
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {recentIterations.map((iter) => (
                    <div
                      key={iter.id}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                        iter.id === currentIteration
                          ? "bg-white/10"
                          : "bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium"
                        style={{ 
                          backgroundColor: `${agent.color}30`,
                          color: agent.color
                        }}
                      >
                        {iter.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-sm">{iter.name}</div>
                        <div className="text-white/40 text-xs">{iter.description}</div>
                      </div>
                      <div
                        className="text-xs px-2 py-1 rounded-full"
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

              {/* Key Insights */}
              <div>
                <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-white/5">
                    <Lightbulb size={14} className="text-yellow-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">
                      Generated 12 alternative approaches in Exploration phase
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-white/5">
                    <AlertTriangle size={14} className="text-orange-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">
                      Identified 3 potential edge cases in current iteration
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm p-2 rounded-lg bg-white/5">
                    <MessageSquare size={14} className="text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-white/70">
                      Synthesized feedback from 5 previous iterations
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div 
            className="flex gap-3 p-5 border-t"
            style={{ borderColor: `${agent.color}30` }}
          >
            <Button
              variant="outline"
              onClick={handleReassign}
              className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 text-white"
            >
              <Settings size={16} className="mr-2" />
              Reassign Role
            </Button>
            <Button
              variant="outline"
              onClick={handleAdjustPriority}
              className="flex-1 bg-white/5 border-white/20 hover:bg-white/10 text-white"
            >
              <Zap size={16} className="mr-2" />
              Adjust Priority
            </Button>
            <Button
              onClick={() => {
                addCommunicationLog('Human', agent.name, 'Viewing full history', 'task');
              }}
              className="flex-1"
              style={{ 
                backgroundColor: agent.color,
                color: '#fff'
              }}
            >
              <History size={16} className="mr-2" />
              Full History
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
