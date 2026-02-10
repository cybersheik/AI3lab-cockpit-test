import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CircleDot,    // Panel 1: Carousel
  Radio,        // Panel 2: Comms
  Terminal,     // Panel 3: Terminals
  Keyboard,     // Panel 4: Input
  BookOpen,     // Panel 5: Notebook
} from 'lucide-react';
import { useAppStore, agents } from '@/store/appStore';
import { cn } from '@/lib/utils';

type PanelId = 'carousel' | 'comms' | 'terminal' | 'input' | 'notebook' | null;

const circleAgents = ['creator', 'red-team', 'co-creator'];

const panels = [
  { id: 'carousel' as const, icon: CircleDot, label: 'Avatars', color: '#6C56FF' },
  { id: 'comms' as const, icon: Radio, label: 'Comms', color: '#00BCD4' },
  { id: 'terminal' as const, icon: Terminal, label: 'Terminal', color: '#4CAF50' },
  { id: 'input' as const, icon: Keyboard, label: 'Input', color: '#FFFFFF' },
  { id: 'notebook' as const, icon: BookOpen, label: 'Notes', color: '#FFC107' },
];

// Agent angles on the ring (same math as AgentCarousel)
const agentAngles = circleAgents.map((_, index) => {
  return (index / circleAgents.length) * Math.PI * 2 - Math.PI / 2;
});

// All 4 agents for the control panel (including coordinator)
const allAgents = agents;

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const { setCarouselRotation, bannerOpen } = useAppStore();

  // Swipe state for carousel panel
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const rotationRef = useRef(0);

  const togglePanel = (panelId: PanelId) => {
    setActivePanel(prev => prev === panelId ? null : panelId);
  };

  // Rotate carousel to specific agent
  const rotateToAgent = useCallback((agentId: string) => {
    const ringIndex = circleAgents.indexOf(agentId);
    if (ringIndex >= 0) {
      // Rotate to face this agent
      const targetRotation = -agentAngles[ringIndex];
      rotationRef.current = targetRotation;
      setCarouselRotation(targetRotation);
    }
    // Coordinator is center — open banner instead
    if (agentId === 'coordinator') {
      useAppStore.getState().openBanner('coordinator');
      setActivePanel(null);
    }
  }, [setCarouselRotation]);

  // Touch swipe on carousel panel
  const onPanelTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  }, []);

  const onPanelTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - lastX.current;
    rotationRef.current += dx * 0.004;
    setCarouselRotation(rotationRef.current);
    lastX.current = e.touches[0].clientX;
  }, [setCarouselRotation]);

  const onPanelTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  if (bannerOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Slide-up Panel */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mx-4 mb-1 rounded-t-2xl overflow-hidden"
            style={{
              background: 'rgba(13, 19, 32, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderBottom: 'none',
            }}
          >
            {/* Panel Content */}
            <div className="p-4" style={{ minHeight: '140px' }}>
              {activePanel === 'carousel' && (
                <CarouselPanel
                  onAgentTap={rotateToAgent}
                  onTouchStart={onPanelTouchStart}
                  onTouchMove={onPanelTouchMove}
                  onTouchEnd={onPanelTouchEnd}
                />
              )}
              {activePanel === 'comms' && (
                <PlaceholderPanel title="Communications" subtitle="Routing & message log — coming soon" />
              )}
              {activePanel === 'terminal' && (
                <PlaceholderPanel title="Terminal" subtitle="Claude Code, ChatGPT Code, Kimi Code — coming soon" />
              )}
              {activePanel === 'input' && (
                <PlaceholderPanel title="Input" subtitle="Keyboard & Microphone — coming soon" />
              )}
              {activePanel === 'notebook' && (
                <PlaceholderPanel title="Notebook" subtitle="Documents, Camera, Dev Journal — coming soon" />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Bar — compact, semi-transparent, bottom-hugging */}
      <div 
        className="flex items-center justify-center gap-3 px-6 py-1"
        style={{
          background: 'rgba(13, 19, 32, 0.4)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {panels.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              onClick={() => togglePanel(panel.id)}
              className={cn(
                "p-2 rounded-full transition-all",
                isActive 
                  ? "bg-white/10" 
                  : "hover:bg-white/5"
              )}
            >
              <Icon 
                size={18} 
                color={isActive ? panel.color : 'rgba(255,255,255,0.3)'}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// === CAROUSEL CONTROL PANEL ===
interface CarouselPanelProps {
  onAgentTap: (agentId: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

function CarouselPanel({ onAgentTap, onTouchStart, onTouchMove, onTouchEnd }: CarouselPanelProps) {
  return (
    <div>
      <div className="text-white/40 text-xs text-center mb-3">
        Tap agent to focus · Swipe to rotate
      </div>

      {/* Swipeable area */}
      <div
        className="flex items-center justify-center gap-6 py-4 rounded-xl"
        style={{ 
          touchAction: 'none',
          background: 'rgba(255,255,255,0.03)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {allAgents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onAgentTap(agent.id)}
            className="flex flex-col items-center gap-2 group"
          >
            {/* Colored sphere */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-active:scale-90"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${agent.color}CC, ${agent.color}66)`,
                boxShadow: `0 0 20px ${agent.glowColor}, inset 0 -2px 4px rgba(0,0,0,0.3)`,
                border: `2px solid ${agent.color}88`,
              }}
            >
              <span className="text-white text-xs font-bold">
                {agent.name.charAt(0)}
              </span>
            </div>
            {/* Label */}
            <div className="text-center">
              <div className="text-[10px] font-semibold" style={{ color: agent.color }}>
                {agent.role}
              </div>
              <div className="text-[9px] text-white/40">
                {agent.name}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Swipe hint */}
      <div className="flex justify-center mt-3">
        <div className="w-16 h-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// === PLACEHOLDER FOR FUTURE PANELS ===
function PlaceholderPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="text-white/70 text-lg font-medium mb-1">{title}</div>
      <div className="text-white/30 text-sm">{subtitle}</div>
    </div>
  );
}
