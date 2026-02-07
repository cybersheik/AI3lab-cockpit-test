import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  FileText,
  Settings,
  BarChart3,
  StickyNote,
  GitBranch,
  Check
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { DoDCard } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const cardIcons: Record<string, typeof FileText> = {
  hypothesis: FileText,
  'run-config': Settings,
  'run-output': BarChart3,
  debrief: StickyNote,
  decision: GitBranch,
};

const statusIcons = {
  pending: Circle,
  'in-progress': Clock,
  completed: CheckCircle2,
};

const statusColors = {
  pending: 'text-white/30',
  'in-progress': 'text-yellow-400',
  completed: 'text-green-400',
};

export function DoDTracker() {
  const { doDCards, currentIteration, updateDoDStatus, getDoDProgress } = useAppStore();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const progress = getDoDProgress();

  const toggleCard = (cardId: string) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const cycleStatus = (card: DoDCard) => {
    const statuses: ('pending' | 'in-progress' | 'completed')[] = ['pending', 'in-progress', 'completed'];
    const currentIndex = statuses.indexOf(card.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    updateDoDStatus(card.id, nextStatus);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="fixed left-4 top-28 bottom-28 w-72 z-40"
    >
      <div className="glass-panel-strong h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-400" />
              <h3 className="text-white font-semibold text-sm">ITERATION {currentIteration}/15 DoD</h3>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-white/50">Progress</span>
                <span className="text-white">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60"
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>

        {/* Cards List */}
        {!isCollapsed && (
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-2">
              {doDCards.map((card) => {
                const Icon = cardIcons[card.id] || FileText;
                const StatusIcon = statusIcons[card.status];
                const isExpanded = expandedCard === card.id;

                return (
                  <div
                    key={card.id}
                    className={cn(
                      "rounded-xl border transition-all duration-300 overflow-hidden",
                      card.status === 'completed' 
                        ? "bg-green-500/5 border-green-500/20" 
                        : card.status === 'in-progress'
                        ? "bg-yellow-500/5 border-yellow-500/20"
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    {/* Card Header */}
                    <div
                      onClick={() => toggleCard(card.id)}
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cycleStatus(card);
                        }}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                          statusColors[card.status]
                        )}
                      >
                        <StatusIcon size={16} />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon size={14} className="text-white/50" />
                          <span className="text-white text-sm font-medium truncate">{card.title}</span>
                        </div>
                        <p className="text-white/50 text-xs truncate mt-0.5">{card.description}</p>
                      </div>
                      <ChevronDown 
                        size={16} 
                        className={cn(
                          "text-white/40 transition-transform",
                          isExpanded && "rotate-180"
                        )} 
                      />
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && card.details && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-white/10"
                        >
                          <div className="p-3">
                            <pre className="text-white/60 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                              {card.details}
                            </pre>
                            <div className="flex gap-2 mt-3">
                              <button className="flex-1 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs transition-colors">
                                Edit
                              </button>
                              {card.status !== 'completed' && (
                                <button 
                                  onClick={() => updateDoDStatus(card.id, 'completed')}
                                  className="flex-1 py-1.5 px-3 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs transition-colors"
                                >
                                  Approve
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button className="w-full py-2 px-4 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Check size={16} />
            Complete Iteration
          </button>
        </div>
      </div>
    </motion.div>
  );
}
