// BottomBar — S008 Master Panel
// 5 slide-up panels: Avatars, Comms, Terminal, Keyboard, Notebook
// Replaces old Speech/Text/Gesture layout
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MessageSquare,
  Terminal,
  Keyboard,
  BookOpen,
  Send,
  MicOff,
  Mic,
  X,
  ChevronDown,
  SkipForward,
  Pause,
  Save,
  FileDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { AgentHubPanel } from './AgentHubPanel';
import { cn } from '@/lib/utils';

type PanelId = 'avatars' | 'comms' | 'terminal' | 'keyboard' | 'notebook';

const panels: { id: PanelId; icon: typeof Users; label: string }[] = [
  { id: 'avatars', icon: Users, label: 'Avatars' },
  { id: 'comms', icon: MessageSquare, label: 'Comms' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
  { id: 'keyboard', icon: Keyboard, label: 'Input' },
  { id: 'notebook', icon: BookOpen, label: 'Notebook' },
];

function KeyboardPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const {
    humanInput,
    setHumanInput,
    sendHumanInput,
    togglePlay,
    setIteration,
    currentIteration,
    addCommunicationLog,
  } = useAppStore();

  const handleSend = () => {
    if (humanInput.trim()) sendHumanInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setHumanInput('Voice input: "Let\'s focus on the pricing model"');
        setIsRecording(false);
      }, 2000);
    }
  };

  const quickCommands = [
    { label: 'Next Iter', icon: SkipForward, action: () => currentIteration < 15 && setIteration(currentIteration + 1), disabled: currentIteration >= 15 },
    { label: 'Pause All', icon: Pause, action: togglePlay },
    { label: 'Save', icon: Save, action: () => addCommunicationLog('System', 'All', 'Session snapshot saved', 'complete') },
    { label: 'Export', icon: FileDown, action: () => addCommunicationLog('System', 'All', 'Export initiated', 'complete') },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Input */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">
            &gt; Human Lead:
          </div>
          <input
            type="text"
            value={humanInput}
            onChange={(e) => setHumanInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your command, question, or direction..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-28 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all text-sm"
          />
          {humanInput && (
            <button onClick={() => setHumanInput('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80">
              <X size={16} />
            </button>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={toggleRecording}
          className={cn('w-10 h-10 rounded-full transition-all', isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/60')}>
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </Button>
        <Button onClick={handleSend} disabled={!humanInput.trim()}
          className="w-10 h-10 rounded-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-30 disabled:cursor-not-allowed">
          <Send size={18} />
        </Button>
      </div>

      {/* Quick Commands */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-white/40 text-xs mr-2">Quick:</span>
        {quickCommands.map((cmd) => {
          const Icon = cmd.icon;
          return (
            <button key={cmd.label} onClick={cmd.action} disabled={cmd.disabled}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10',
                cmd.disabled && 'opacity-30 cursor-not-allowed')}>
              <Icon size={14} />
              <span>{cmd.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <span className="text-white/20 text-sm">{title} — coming soon</span>
    </div>
  );
}

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    if (activePanel) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [activePanel]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePanel(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const togglePanel = (id: PanelId) => {
    setActivePanel(prev => prev === id ? null : id);
  };

  return (
    <motion.footer
      ref={panelRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-3"
    >
      <div className="glass-panel-strong mx-auto max-w-[1600px] overflow-hidden">
        {/* Slide-up Panel Content */}
        <AnimatePresence>
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              {/* Collapse handle */}
              <div className="flex justify-center pt-2 pb-1">
                <button
                  onClick={() => setActivePanel(null)}
                  className="flex items-center gap-1 px-3 py-0.5 rounded-full text-white/20 hover:text-white/40 transition-colors"
                >
                  <ChevronDown size={14} />
                  <span className="text-[10px]">collapse</span>
                </button>
              </div>

              {/* Panel content */}
              <div className="px-4 pb-3 min-h-[120px] max-h-[55vh]">
                {activePanel === 'avatars' && <PlaceholderPanel title="Avatar Control" />}
                {activePanel === 'comms' && <AgentHubPanel />}
                {activePanel === 'terminal' && <PlaceholderPanel title="Agent Terminal" />}
                {activePanel === 'keyboard' && <KeyboardPanel />}
                {activePanel === 'notebook' && <PlaceholderPanel title="Session Notebook" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Bar — always visible */}
        <div className="flex items-center justify-around py-2 px-2 border-t border-white/[0.06]">
          {panels.map((panel) => {
            const Icon = panel.icon;
            const isActive = activePanel === panel.id;
            return (
              <button
                key={panel.id}
                onClick={() => togglePanel(panel.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all min-w-[56px]',
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                )}
              >
                <Icon size={18} />
                <span className="text-[9px] font-medium">{panel.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.footer>
  );
}
