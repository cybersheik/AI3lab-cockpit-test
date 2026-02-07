import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  BookOpen, 
  ChevronDown, 
  ChevronUp,
  Target,
  Users,
  FolderOpen,
  ExternalLink,
  Edit3,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import type { CommunicationLogEntry } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const communicationIcons: Record<CommunicationLogEntry['type'], typeof MessageCircle> = {
  speech: MessageCircle,
  task: Target,
  feedback: RotateCcw,
  complete: CheckCircle2,
};

const communicationColors: Record<CommunicationLogEntry['type'], string> = {
  speech: 'text-[#2196F3]',
  task: 'text-[#FF9800]',
  feedback: 'text-[#FFEB3B]',
  complete: 'text-[#4CAF50]',
};

export function RightSidebar() {
  const { 
    communicationLogs, 
    sessionObjective, 
    successCriteria, 
    knowledgeBase,
    addCommunicationLog,
  } = useAppStore();
  
  const [commCollapsed, setCommCollapsed] = useState(false);
  const [contextCollapsed, setContextCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="fixed right-4 top-28 bottom-28 w-80 z-40"
    >
      <div className="glass-panel-strong h-full flex flex-col">
        {/* Active Communications Section */}
        <div className="border-b border-white/10">
          {/* Section Header */}
          <button
            onClick={() => setCommCollapsed(!commCollapsed)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-[#6C56FF]" />
              <h3 className="text-white font-semibold text-sm">Active Communications</h3>
            </div>
            {commCollapsed ? <ChevronDown size={16} className="text-white/40" /> : <ChevronUp size={16} className="text-white/40" />}
          </button>

          {/* Communication Log */}
          <AnimatePresence>
            {!commCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <ScrollArea className="h-48 px-3">
                  <div className="space-y-2 pb-3">
                    {communicationLogs.map((log) => {
                      const Icon = communicationIcons[log.type];
                      const colorClass = communicationColors[log.type];

                      return (
                        <div
                          key={log.id}
                          className="flex items-start gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Icon size={14} className={cn("mt-0.5 shrink-0", colorClass)} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-white/70 font-medium">{log.from}</span>
                              <ArrowRight size={10} className="text-white/30" />
                              <span className="text-white/70">{log.to}</span>
                            </div>
                            <p className="text-white/50 text-xs truncate mt-0.5">{log.message}</p>
                          </div>
                          <span className="text-white/30 text-[10px] shrink-0">{log.timestamp}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Full Log Button */}
          <AnimatePresence>
            {!commCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 pb-3"
              >
                <button className="w-full py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={12} />
                  View Full Log
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Session Context Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Section Header */}
          <button
            onClick={() => setContextCollapsed(!contextCollapsed)}
            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-[#4CAF50]" />
              <h3 className="text-white font-semibold text-sm">Session Context</h3>
            </div>
            {contextCollapsed ? <ChevronDown size={16} className="text-white/40" /> : <ChevronUp size={16} className="text-white/40" />}
          </button>

          {/* Context Content */}
          <AnimatePresence>
            {!contextCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex-1"
              >
                <ScrollArea className="flex-1 px-4 pb-4">
                  <div className="space-y-4">
                    {/* Objective */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target size={12} className="text-white/40" />
                        <span className="text-white/50 text-xs uppercase tracking-wider">Objective</span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{sessionObjective}</p>
                    </div>

                    {/* Success Criteria */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={12} className="text-white/40" />
                        <span className="text-white/50 text-xs uppercase tracking-wider">Success Criteria</span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed">{successCriteria}</p>
                    </div>

                    {/* Participants */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users size={12} className="text-white/40" />
                        <span className="text-white/50 text-xs uppercase tracking-wider">Participants</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#2196F3]/30 border border-white/20 flex items-center justify-center text-[10px] text-[#2196F3]">H1</div>
                          <div className="w-6 h-6 rounded-full bg-[#2196F3]/30 border border-white/20 flex items-center justify-center text-[10px] text-[#2196F3]">H2</div>
                          <div className="w-6 h-6 rounded-full bg-[#4CAF50]/30 border border-white/20 flex items-center justify-center text-[10px] text-[#4CAF50]">AI</div>
                          <div className="w-6 h-6 rounded-full bg-[#9C27B0]/30 border border-white/20 flex items-center justify-center text-[10px] text-[#9C27B0]">+3</div>
                        </div>
                        <span className="text-white/60 text-xs">2 humans, 4 AI agents</span>
                      </div>
                    </div>

                    {/* Knowledge Base */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FolderOpen size={12} className="text-white/40" />
                        <span className="text-white/50 text-xs uppercase tracking-wider">Knowledge Base</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                        <span className="text-white/70 text-sm font-mono">{knowledgeBase}</span>
                        <button className="ml-auto text-white/40 hover:text-white/80 transition-colors">
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => addCommunicationLog('Human', 'All', 'Opening Knowledge Base', 'task')}
                        className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FolderOpen size={12} />
                        Open KB
                      </button>
                      <button className="flex-1 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs transition-colors flex items-center justify-center gap-1.5">
                        <Edit3 size={12} />
                        Edit Context
                      </button>
                    </div>
                  </div>
                </ScrollArea>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
