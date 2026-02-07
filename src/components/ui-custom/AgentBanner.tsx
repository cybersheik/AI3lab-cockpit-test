import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  BarChart3,
  MessageSquare,
  FileText,
  Send,
  Paperclip,
  Camera,
  PenTool,
  Mic,
  Keyboard,
  Hand,
  Globe,
  Target,
  ArrowLeftRight,
  RotateCw,
  CircleDot,
  ArrowRight,
  User,
  Bookmark,
  Check,
  Clock,
  TrendingUp,
  Activity,
  Cpu,
  Layers
} from 'lucide-react';
import { useAppStore, agents } from '@/store/appStore';
import type { BannerPanel, RoutingMode } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Routing icons configuration
const routingModes: { id: RoutingMode; icon: typeof Globe; label: string; color: string }[] = [
  { id: 'all', icon: Globe, label: 'Send to All', color: '#4CAF50' },
  { id: 'selected', icon: Target, label: 'Send to Selected', color: '#2196F3' },
  { id: 'cycle', icon: ArrowLeftRight, label: 'Cycle Exchange', color: '#FF9800' },
  { id: 'sequence', icon: RotateCw, label: 'Sequential', color: '#9C27B0' },
  { id: 'parallel', icon: CircleDot, label: 'Parallel', color: '#00BCD4' },
  { id: 'direct', icon: ArrowRight, label: 'Direct Send', color: '#E91E63' },
  { id: 'human', icon: User, label: 'Send to Human', color: '#FF5722' },
  { id: 'bookmark', icon: Bookmark, label: 'Bookmark', color: '#795548' },
];

// Input modes
const inputModes = [
  { id: 'speech', icon: Mic, label: 'Speech' },
  { id: 'text', icon: Keyboard, label: 'Text' },
  { id: 'gesture', icon: Hand, label: 'Gesture' },
];

interface AgentBannerProps {
  agentId: string;
  onClose: () => void;
}

export function AgentBanner({ agentId, onClose }: AgentBannerProps) {
  const { 
    bannerPanel, 
    setBannerPanel, 
    routingMode, 
    setRoutingMode,
    communicationLogs,
    addCommunicationLog,
  } = useAppStore();
  
  const [inputMode, setInputMode] = useState('text');
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showRoutingSelector, setShowRoutingSelector] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;

  // Filter chat messages for this agent
  const agentChatMessages = communicationLogs.filter(
    log => log.from === agent.name || log.to === agent.name
  );

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentChatMessages]);

  // Panel navigation
  const panels: BannerPanel[] = ['metrics', 'chat', 'summary'];
  const currentPanelIndex = panels.indexOf(bannerPanel);

  const goToPanel = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPanelIndex > 0) {
      setBannerPanel(panels[currentPanelIndex - 1]);
    } else if (direction === 'next' && currentPanelIndex < panels.length - 1) {
      setBannerPanel(panels[currentPanelIndex + 1]);
    }
  };

  // Handle chat send
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    
    setIsTyping(true);
    addCommunicationLog('Human', agent.name, chatInput, 'speech');
    setChatInput('');
    
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      addCommunicationLog(agent.name, 'Human', `Response from ${agent.name}: Processing your request...`, 'speech');
    }, 1500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        setBannerPanel('metrics');
      } else if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        setBannerPanel('chat');
      } else if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        setBannerPanel('summary');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setBannerPanel, onClose]);

  // Panel content components
  const MetricsPanel = () => (
    <div className="space-y-4 p-4">
      {/* Performance Metrics */}
      <div className="glass-panel p-4">
        <h4 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
          <BarChart3 size={16} className="text-indigo-400" />
          Performance Metrics
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Response Time', value: '1.2s', icon: Clock, color: '#4CAF50' },
            { label: 'Accuracy Score', value: '94%', icon: TrendingUp, color: '#2196F3' },
            { label: 'Tasks Completed', value: '47', icon: Check, color: '#FF9800' },
            { label: 'Active Iterations', value: '3', icon: Activity, color: '#9C27B0' },
            { label: 'Resource Usage', value: '62%', icon: Cpu, color: '#00BCD4' },
            { label: 'Contributions', value: 'High', icon: Layers, color: '#E91E63' },
          ].map((metric) => (
            <div key={metric.label} className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <metric.icon size={14} style={{ color: metric.color }} />
                <span className="text-white/50 text-xs">{metric.label}</span>
              </div>
              <div className="text-white text-lg font-semibold">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Tasks */}
      <div className="glass-panel p-4">
        <h4 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
          <Check size={16} className="text-green-400" />
          Current Tasks
        </h4>
        <div className="space-y-2">
          {[
            { task: 'Analyze pricing model risks', completed: true },
            { task: 'Generate alternative approaches', completed: true },
            { task: 'Validate enterprise segment assumptions', completed: false },
            { task: 'Prepare synthesis report', completed: false },
          ].map((item, idx) => (
            <label 
              key={idx} 
              className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
            >
              <input 
                type="checkbox" 
                checked={item.completed}
                readOnly
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-indigo-500 focus:ring-indigo-500"
              />
              <span className={cn(
                "text-sm transition-all",
                item.completed ? "text-white/40 line-through" : "text-white/80"
              )}>
                {item.task}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const ChatPanel = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-blue-400" />
          <span className="text-white/70 text-sm">Live Chat with {agent.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: agent.color }}
          />
          <span className="text-white/50 text-xs">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {agentChatMessages.map((msg) => (
            <div 
              key={msg.id} 
              className={cn(
                "flex flex-col",
                msg.from === 'Human' ? "items-end" : "items-start"
              )}
            >
              <div 
                className={cn(
                  "max-w-[80%] px-3 py-2 rounded-xl text-sm",
                  msg.from === 'Human' 
                    ? "bg-indigo-500/30 text-white rounded-br-sm" 
                    : "bg-white/10 text-white/90 rounded-bl-sm"
                )}
              >
                <div className="text-xs text-white/50 mb-1">{msg.from}</div>
                {msg.message}
              </div>
              <span className="text-white/30 text-[10px] mt-1">{msg.timestamp}</span>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="px-3 py-2 rounded-xl bg-white/10 rounded-bl-sm">
                <div className="flex items-center gap-1">
                  <span className="text-white/50 text-sm">{agent.name} is typing</span>
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={`Message ${agent.name}...`}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
          <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">
            <Paperclip size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">
            <Camera size={16} />
          </button>
          <button className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors">
            <PenTool size={16} />
          </button>
          <button 
            onClick={handleSendMessage}
            disabled={!chatInput.trim()}
            className="w-9 h-9 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const SummaryPanel = () => (
    <div className="space-y-4 p-4">
      {/* Session Summary */}
      <div className="glass-panel p-4">
        <h4 className="text-white/70 text-sm font-medium mb-3 flex items-center gap-2">
          <FileText size={16} className="text-purple-400" />
          Session Summary
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-white/50 text-xs">Total Messages</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">7</div>
            <div className="text-white/50 text-xs">Key Insights</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <div className="text-white/50 text-xs">Decisions Made</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">5</div>
            <div className="text-white/50 text-xs">Action Items</div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="glass-panel p-4">
        <h4 className="text-white/70 text-sm font-medium mb-3">Export Options</h4>
        <div className="space-y-2">
          {[
            { label: 'Full Transcription', icon: FileText },
            { label: 'Summary Report', icon: BarChart3 },
            { label: 'Context Snapshot', icon: Layers },
            { label: 'Prompt for Next Session', icon: MessageSquare },
          ].map((option) => (
            <button
              key={option.label}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm transition-colors"
            >
              <option.icon size={16} className="text-white/50" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Context for Next Session */}
      <div className="glass-panel p-4">
        <h4 className="text-white/70 text-sm font-medium mb-2">Context for Next Session</h4>
        <textarea
          readOnly
          value={`Current focus: Pricing model validation for enterprise segment.\nNext steps: Test adjusted churn rate assumption (20%).\nOpen questions: CAC sensitivity analysis needed.`}
          className="w-full h-24 bg-white/5 border border-white/10 rounded-lg p-3 text-white/70 text-sm resize-none"
        />
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        {/* Banner */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl h-[80vh] glass-panel-strong overflow-hidden flex flex-col"
          style={{ borderColor: agent.color }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: `${agent.color}30` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${agent.color}20` }}
              >
                <Activity size={20} style={{ color: agent.color }} />
              </div>
              <div>
                <h2 className="text-white font-bold">{agent.name}</h2>
                <p className="text-sm" style={{ color: agent.color }}>{agent.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/60"
            >
              <X size={18} />
            </button>
          </div>

          {/* Routing Panel */}
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {routingModes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = routingMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setRoutingMode(mode.id);
                        if (['selected', 'cycle', 'sequence', 'parallel', 'direct', 'human'].includes(mode.id)) {
                          setShowRoutingSelector(true);
                        }
                      }}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        isActive 
                          ? "bg-white/20" 
                          : "bg-white/5 hover:bg-white/10"
                      )}
                      title={mode.label}
                    >
                      <Icon size={16} style={{ color: isActive ? mode.color : '#ffffff80' }} />
                    </button>
                  );
                })}
              </div>
              
              {showRoutingSelector && (
                <div className="flex items-center gap-2">
                  <span className="text-white/50 text-xs">Select targets:</span>
                  <div className="flex gap-1">
                    {agents.filter(a => a.id !== agentId).map(a => (
                      <button
                        key={a.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors"
                        style={{ 
                          backgroundColor: `${a.color}30`,
                          color: a.color 
                        }}
                      >
                        {a.name[0]}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowRoutingSelector(false)}
                    className="text-white/50 hover:text-white/80"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={bannerPanel}
                initial={{ opacity: 0, x: bannerPanel === 'chat' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: bannerPanel === 'chat' ? -20 : 20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {bannerPanel === 'metrics' && <MetricsPanel />}
                {bannerPanel === 'chat' && <ChatPanel />}
                {bannerPanel === 'summary' && <SummaryPanel />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Navigation */}
          <div className="p-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              {/* Panel Indicators & Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => goToPanel('prev')}
                  disabled={currentPanelIndex === 0}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white/60"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {panels.map((panel, idx) => (
                    <button
                      key={panel}
                      onClick={() => setBannerPanel(panel)}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full transition-all",
                        idx === currentPanelIndex 
                          ? "bg-indigo-500 w-4" 
                          : "bg-white/20 hover:bg-white/40"
                      )}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => goToPanel('next')}
                  disabled={currentPanelIndex === panels.length - 1}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-white/60"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Input Mode & Send */}
              <div className="flex items-center gap-2">
                {inputModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setInputMode(mode.id)}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        inputMode === mode.id
                          ? "bg-white/20 text-white"
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      )}
                      title={mode.label}
                    >
                      <Icon size={14} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
