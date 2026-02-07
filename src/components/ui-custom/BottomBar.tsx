import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mic,
  Keyboard,
  Hand,
  Send,
  MicOff,
  SkipForward,
  Pause,
  Save,
  FileDown,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/appStore';
import { cn } from '@/lib/utils';

type InputMode = 'speech' | 'text' | 'gesture';

export function BottomBar() {
  const [inputMode, setInputMode] = useState<InputMode>('text');
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
    if (humanInput.trim()) {
      sendHumanInput();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setHumanInput('Voice input: "Let\'s focus on the pricing model for enterprise clients"');
        setIsRecording(false);
      }, 2000);
    }
  };

  const quickCommands = [
    { 
      label: 'Next Iter', 
      icon: SkipForward, 
      action: () => currentIteration < 15 && setIteration(currentIteration + 1),
      disabled: currentIteration >= 15
    },
    { 
      label: 'Pause All', 
      icon: Pause, 
      action: togglePlay 
    },
    { 
      label: 'Save Snapshot', 
      icon: Save, 
      action: () => addCommunicationLog('System', 'All', 'Session snapshot saved', 'complete')
    },
    { 
      label: 'Export', 
      icon: FileDown, 
      action: () => addCommunicationLog('System', 'All', 'Export initiated', 'complete')
    },
  ];

  const inputModes: { id: InputMode; icon: typeof Mic; label: string }[] = [
    { id: 'speech', icon: Mic, label: 'Speech' },
    { id: 'text', icon: Keyboard, label: 'Text' },
    { id: 'gesture', icon: Hand, label: 'Gesture' },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3"
    >
      <div className="glass-panel-strong mx-auto max-w-[1600px]">
        {/* Input Mode Selector */}
        <div className="flex items-center justify-center gap-1 p-2 border-b border-white/10">
          {inputModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = inputMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setInputMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
              >
                <Icon size={16} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Input Area */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Input Field */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">
                &gt; Human Lead:
              </div>
              <input
                type="text"
                value={humanInput}
                onChange={(e) => setHumanInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your command, question, or direction here..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-28 pr-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#6C56FF]/50 focus:bg-white/10 transition-all"
              />
              {humanInput && (
                <button
                  onClick={() => setHumanInput('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Voice Record Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleRecording}
                className={cn(
                  "w-10 h-10 rounded-full transition-all",
                  isRecording 
                    ? "bg-red-500/20 text-red-400 animate-pulse" 
                    : "hover:bg-white/10 text-white/60"
                )}
                title={isRecording ? 'Stop Recording' : 'Voice Record'}
              >
                {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
              </Button>

              {/* Send Button */}
              <Button
                onClick={handleSend}
                disabled={!humanInput.trim()}
                className="w-10 h-10 rounded-full bg-[#6C56FF] hover:bg-[#5a48d9] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="flex items-center justify-center gap-2 px-4 pb-3">
          <span className="text-white/40 text-xs mr-2">Quick Commands:</span>
          {quickCommands.map((cmd) => {
            const Icon = cmd.icon;
            return (
              <button
                key={cmd.label}
                onClick={cmd.action}
                disabled={cmd.disabled}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10",
                  cmd.disabled && "opacity-30 cursor-not-allowed"
                )}
              >
                <Icon size={14} />
                <span>{cmd.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.footer>
  );
}
