/**
 * AI³Lab BottomBar — Emergent Crystallization
 *
 * Philosophy: Panels don't "appear" — they crystallize from a latent particle field.
 * The dock area contains ambient drifting particles (latent matter).
 * User gesture triggers crystallization: particles converge, noise dissolves, form emerges.
 * On close, the panel dissolves back into the field. Energy is never lost — only redistributed.
 *
 * Inspired by Kimi's Materialize variant, reimagined through algorithmic art philosophy.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CircleDot,
  Radio,
  Terminal,
  Keyboard,
  BookOpen,
  X,
  Send,
  Mic,
  ChevronRight,
  FileText,
  Camera,
  Eye,
} from 'lucide-react';
import { useAppStore, agents, defaultCommunicationLogs } from '@/store/appStore';
import { cn } from '@/lib/utils';

import type { LucideIcon } from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────
type PanelId = 'carousel' | 'comms' | 'terminal' | 'input' | 'notebook' | null;

interface PanelConfig {
  id: Exclude<PanelId, null>;
  icon: LucideIcon;
  label: string;
  color: string;
  glowColor: string;
}

// ─── PANEL CONFIGS ────────────────────────────────────
const PANELS: PanelConfig[] = [
  { id: 'carousel', icon: CircleDot, label: 'Avatars', color: '#6C56FF', glowColor: 'rgba(108, 86, 255, 0.5)' },
  { id: 'comms',    icon: Radio,     label: 'Comm',    color: '#00BCD4', glowColor: 'rgba(0, 188, 212, 0.5)' },
  { id: 'terminal', icon: Terminal,  label: 'Code',    color: '#4CAF50', glowColor: 'rgba(76, 175, 80, 0.5)' },
  { id: 'input',    icon: Keyboard,  label: 'Input',   color: '#FFFFFF', glowColor: 'rgba(255, 255, 255, 0.3)' },
  { id: 'notebook', icon: BookOpen,  label: 'Notes',   color: '#FFC107', glowColor: 'rgba(255, 193, 7, 0.5)' },
];

// Carousel math (mirrors AgentCarousel.tsx)
const circleAgents = ['creator', 'red-team', 'co-creator'];
const agentAngles = circleAgents.map((_, i) => (i / circleAgents.length) * Math.PI * 2 - Math.PI / 2);

// ─── AMBIENT PARTICLE FIELD ───────────────────────────
// Latent matter drifting near the dock — the "energy" that crystallizes into panels.
function AmbientParticleField({ activePanel }: { activePanel: PanelId }) {
  const particles = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: 10 + (i / 18) * 80 + (Math.sin(i * 2.7) * 8),
      baseY: 30 + Math.sin(i * 1.3) * 25,
      size: 1.5 + Math.random() * 2,
      colorIndex: i % PANELS.length,
      driftDuration: 4 + Math.random() * 6,
      driftDelay: Math.random() * -8,
      driftAmplitudeX: 6 + Math.random() * 10,
      driftAmplitudeY: 4 + Math.random() * 8,
    }));
  }, []);

  const isConverging = activePanel !== null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => {
        const panelColor = PANELS[p.colorIndex].color;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: panelColor,
              left: `${p.x}%`,
              top: `${p.baseY}%`,
              filter: `blur(${p.size > 2.5 ? 1 : 0}px)`,
            }}
            animate={isConverging ? {
              opacity: [0.25, 0],
              y: [-20, -60],
              scale: [1, 0],
              transition: { duration: 0.5, delay: p.id * 0.02 },
            } : {
              opacity: [0.08, 0.25, 0.08],
              x: [0, p.driftAmplitudeX, -p.driftAmplitudeX / 2, 0],
              y: [0, -p.driftAmplitudeY, p.driftAmplitudeY / 2, 0],
              transition: {
                duration: p.driftDuration,
                delay: p.driftDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
          />
        );
      })}
    </div>
  );
}

// ─── MATERIALIZE EFFECT ───────────────────────────────
// Particles converge from the field to form the panel edges
function MaterializeEffect({ color, isActive }: { color: string; isActive: boolean }) {
  const count = 36;
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 120 + Math.random() * 80;
      return { angle, radius, size: 1 + Math.random() * 2 };
    });
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            left: `${50 + Math.cos(p.angle) * p.radius * 0.5}%`,
            top: `${50 + Math.sin(p.angle) * p.radius * 0.5}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={isActive ? {
            opacity: [0, 0.8, 0.3, 0],
            scale: [0, 1.5, 1, 0],
            x: [`0%`, `${-Math.cos(p.angle) * p.radius * 0.4}%`],
            y: [`0%`, `${-Math.sin(p.angle) * p.radius * 0.4}%`],
          } : { opacity: 0, scale: 0 }}
          transition={{
            duration: 0.7,
            delay: i * 0.012,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      ))}
    </div>
  );
}

// ─── NOISE OVERLAY ────────────────────────────────────
// fractalNoise texture that dissolves as the panel crystallizes
function NoiseOverlay({ isActive }: { isActive: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-2xl"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: isActive ? 0 : 0.4 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    />
  );
}

// ─── SHIMMER EFFECT ───────────────────────────────────
// Single gradient wave sweeping across the panel on materialization
function ShimmerEffect({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${color}15 50%, transparent 100%)`,
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}

// ─── DOCK TRIGGER ─────────────────────────────────────
// Hexagonal-clipped icon with glow ring, breathing active state, accent line
function DockTrigger({
  config, isActive, onClick
}: {
  config: PanelConfig; isActive: boolean; onClick: () => void;
}) {
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      className="relative group flex flex-col items-center gap-1 p-2 rounded-xl transition-all focus:outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Glow ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          filter: 'blur(10px)',
        }}
      />

      {/* Active background pulse */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              background: `linear-gradient(135deg, ${config.color}20, ${config.color}05)`,
              border: `1px solid ${config.color}40`,
              boxShadow: `0 0 20px ${config.glowColor}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Hexagonal icon clip */}
      <div className="relative">
        <motion.div
          className="w-9 h-9 flex items-center justify-center transition-all duration-300"
          animate={isActive ? {
            scale: [1, 1.04, 1],
            transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
          } : {}}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: isActive
              ? `linear-gradient(135deg, ${config.color}35, ${config.color}10)`
              : 'rgba(255,255,255,0.04)',
          }}
        >
          <Icon
            size={16}
            color={isActive ? config.color : 'rgba(255,255,255,0.35)'}
            style={{ filter: isActive ? `drop-shadow(0 0 6px ${config.color})` : 'none' }}
          />
        </motion.div>
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-[9px] font-medium tracking-wide transition-all duration-300",
          isActive ? "text-white" : "text-white/30 group-hover:text-white/60"
        )}
        style={isActive ? { textShadow: `0 0 8px ${config.glowColor}` } : {}}
      >
        {config.label}
      </span>

      {/* Bottom accent line */}
      <motion.div
        className="absolute -bottom-0.5 h-[2px] rounded-full"
        style={{ backgroundColor: config.color }}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: isActive ? 20 : 0, opacity: isActive ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

// ═══════════════════════════════════════════════════════
// PANEL CONTENT COMPONENTS
// ═══════════════════════════════════════════════════════

// ─── CAROUSEL PANEL ───────────────────────────────────
interface CarouselPanelProps {
  onAgentTap: (agentId: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClose: () => void;
}

function CarouselPanel({ onAgentTap, onTouchStart, onTouchMove, onTouchEnd, onClose }: CarouselPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <CircleDot size={14} className="text-[#6C56FF]" />
          Avatar Carousel
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div
        className="flex items-center justify-center gap-5 py-3 rounded-xl flex-1"
        style={{ touchAction: 'none', background: 'rgba(255,255,255,0.02)' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {agents.map((agent, i) => (
          <motion.button
            key={agent.id}
            onClick={() => onAgentTap(agent.id)}
            className="flex flex-col items-center gap-1.5 group"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 + i * 0.08, type: 'spring' }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
          >
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center transition-transform"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${agent.color}CC, ${agent.color}55)`,
                boxShadow: `0 0 16px ${agent.glowColor}`,
                border: `1.5px solid ${agent.color}77`,
              }}
            >
              <span className="text-white text-xs font-bold">{agent.name.charAt(0)}</span>
            </div>
            <div className="text-center">
              <div className="text-[9px] font-semibold" style={{ color: agent.color }}>{agent.role}</div>
              <div className="text-[8px] text-white/35">{agent.name}</div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="text-white/25 text-[10px] text-center mt-2">
        Tap agent to focus · Swipe to rotate
      </div>
    </div>
  );
}

// ─── COMM PANEL ───────────────────────────────────────
function CommPanel({ onClose }: { onClose: () => void }) {
  const { communicationLogs } = useAppStore();
  const logs = communicationLogs.length > 0 ? communicationLogs.slice(0, 5) : defaultCommunicationLogs.slice(0, 5);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <Radio size={14} className="text-[#00BCD4]" />
          Communication Router
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-1.5">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors border-l-2 border-[#00BCD4]/60"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.06 }}
          >
            <div className="flex items-center gap-1.5 text-[10px] text-white/45 mb-0.5">
              <span>{log.from}</span>
              <ChevronRight size={10} />
              <span>{log.to}</span>
              <span className="ml-auto font-mono">{log.timestamp}</span>
            </div>
            <p className="text-white/80 text-xs">{log.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── TERMINAL PANEL ───────────────────────────────────
function TerminalPanel({ onClose }: { onClose: () => void }) {
  const tabs = [
    { id: 'claude', name: 'Claude Code', color: '#4CAF50' },
    { id: 'gpt', name: 'ChatGPT', color: '#FF5722' },
    { id: 'kimi', name: 'Kimi', color: '#6C56FF' },
    { id: 'qwen', name: 'Qwen', color: '#2196F3' },
  ];
  const [activeTab, setActiveTab] = useState('claude');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <Terminal size={14} className="text-[#4CAF50]" />
          Code Terminal
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="flex gap-1 mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all",
              activeTab === tab.id ? "text-white" : "text-white/35 hover:text-white/60"
            )}
            style={activeTab === tab.id ? { backgroundColor: `${tab.color}25` } : {}}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 p-3 rounded-lg bg-black/40 font-mono text-[11px] overflow-auto border border-white/[0.06]">
        <motion.p className="text-green-400/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          $ analyzing business_model.py
        </motion.p>
        <motion.p className="text-white/50 mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
          Loading hypothesis validation...
        </motion.p>
        <motion.p className="text-blue-400/80 mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          → LTV:CAC ratio: 8.3 ✓
        </motion.p>
        <motion.p className="text-blue-400/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          → Churn rate: 12% ✓
        </motion.p>
        <motion.p className="text-yellow-400/80 mt-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
          ⚠ Warning: Enterprise segment underexplored
        </motion.p>
        <motion.p className="text-white/30 mt-2 animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          _
        </motion.p>
      </div>
    </div>
  );
}

// ─── INPUT PANEL ──────────────────────────────────────
function InputPanel({ onClose }: { onClose: () => void }) {
  const { humanInput, setHumanInput, sendHumanInput } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <Keyboard size={14} className="text-white/70" />
          Human Input
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <textarea
          value={humanInput}
          onChange={(e) => setHumanInput(e.target.value)}
          placeholder="Type your command, question, or direction..."
          className="flex-1 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white text-xs placeholder:text-white/20 resize-none focus:outline-none focus:border-white/20 transition-colors"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              isRecording ? "bg-red-500/25 animate-pulse" : "bg-white/[0.06] hover:bg-white/10"
            )}
          >
            <Mic size={16} className={isRecording ? "text-red-400" : "text-white/50"} />
          </button>

          <button
            onClick={sendHumanInput}
            disabled={!humanInput.trim()}
            className={cn(
              "flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-medium transition-all",
              humanInput.trim()
                ? "bg-white/[0.12] hover:bg-white/[0.18] text-white"
                : "bg-white/[0.03] text-white/25 cursor-not-allowed"
            )}
          >
            <Send size={14} />
            Send to Coordinator
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NOTEBOOK PANEL ───────────────────────────────────
function NotebookPanel({ onClose }: { onClose: () => void }) {
  const [activeView, setActiveView] = useState<'camera' | 'notes' | 'docs'>('notes');

  const views = [
    { id: 'camera' as const, icon: Camera, label: 'Vision' },
    { id: 'notes' as const, icon: FileText, label: 'Journal' },
    { id: 'docs' as const, icon: Eye, label: 'Docs' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <BookOpen size={14} className="text-[#FFC107]" />
          System Eyes
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>

      <div className="flex gap-1.5 mb-3">
        {views.map((v) => {
          const VIcon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                activeView === v.id
                  ? "bg-[#FFC107]/15 text-[#FFC107]"
                  : "bg-white/[0.03] text-white/35 hover:text-white/60"
              )}
            >
              <VIcon size={12} />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 rounded-xl bg-white/[0.02] overflow-auto p-3">
        {activeView === 'camera' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Camera size={32} className="mx-auto text-white/15 mb-3" />
              <p className="text-white/30 text-xs">Camera feed for AI agents</p>
            </div>
          </div>
        )}

        {activeView === 'notes' && (
          <div className="space-y-2">
            {[
              { time: '14:35 — Iteration 7', text: 'Focus shifted to enterprise pricing model. LTV:CAC looks promising.' },
              { time: '14:42 — Red Team Input', text: 'Identified risk: SMB segment may be underserved.' },
            ].map((note, i) => (
              <motion.div
                key={i}
                className="p-2.5 rounded-lg bg-white/[0.03]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <p className="text-white/40 text-[10px] mb-0.5">{note.time}</p>
                <p className="text-white/75 text-xs">{note.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeView === 'docs' && (
          <div className="grid grid-cols-2 gap-1.5">
            {['Business Model Canvas', 'Hypothesis Log', 'Run Config', 'Debrief Notes'].map((doc, i) => (
              <motion.button
                key={doc}
                className="p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <FileText size={12} className="text-white/30 mb-1.5" />
                <p className="text-white/70 text-[10px]">{doc}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function BottomBar() {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const { setCarouselRotation, bannerOpen } = useAppStore();

  // Swipe state for carousel panel
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const rotationRef = useRef(0);

  const togglePanel = (panelId: Exclude<PanelId, null>) => {
    setActivePanel(prev => prev === panelId ? null : panelId);
  };

  const closePanel = useCallback(() => setActivePanel(null), []);

  // Rotate carousel to specific agent
  const rotateToAgent = useCallback((agentId: string) => {
    const ringIndex = circleAgents.indexOf(agentId);
    if (ringIndex >= 0) {
      const targetRotation = -agentAngles[ringIndex];
      rotationRef.current = targetRotation;
      setCarouselRotation(targetRotation);
    }
    if (agentId === 'coordinator') {
      useAppStore.getState().openBanner('coordinator');
      setActivePanel(null);
    }
  }, [setCarouselRotation]);

  // Touch swipe on carousel
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
  const onPanelTouchEnd = useCallback(() => { isDragging.current = false; }, []);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActivePanel(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (bannerOpen) return null;

  const activeConfig = PANELS.find(p => p.id === activePanel);

  // Panel content renderer
  const renderPanelContent = () => {
    switch (activePanel) {
      case 'carousel':
        return (
          <CarouselPanel
            onAgentTap={rotateToAgent}
            onTouchStart={onPanelTouchStart}
            onTouchMove={onPanelTouchMove}
            onTouchEnd={onPanelTouchEnd}
            onClose={closePanel}
          />
        );
      case 'comms': return <CommPanel onClose={closePanel} />;
      case 'terminal': return <TerminalPanel onClose={closePanel} />;
      case 'input': return <InputPanel onClose={closePanel} />;
      case 'notebook': return <NotebookPanel onClose={closePanel} />;
      default: return null;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* ── Scene Resonance Tint ── */}
      <AnimatePresence>
        {activePanel && activeConfig && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${activeConfig.color}08 0%, transparent 60%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      {/* ── Materialize Panel ── */}
      <AnimatePresence>
        {activePanel && activeConfig && (
          <div className="absolute bottom-[56px] left-3 right-3 pointer-events-auto flex items-end justify-center" style={{ maxHeight: '280px' }}>
            {/* Materialize particle convergence */}
            <MaterializeEffect
              color={activeConfig.color}
              isActive={!!activePanel}
            />

            {/* The crystallized panel */}
            <motion.div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{
                height: '260px',
                background: 'linear-gradient(180deg, rgba(13, 19, 32, 0.97) 0%, rgba(10, 14, 23, 0.99) 100%)',
                border: `1px solid ${activeConfig.color}30`,
                boxShadow: `0 -20px 60px ${activeConfig.glowColor}, 0 0 1px ${activeConfig.color}40, inset 0 1px 0 rgba(255,255,255,0.06)`,
              }}
              initial={{
                opacity: 0,
                scale: 0.92,
                filter: 'blur(16px)',
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                transition: {
                  duration: 0.45,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                filter: 'blur(8px)',
                transition: { duration: 0.25 },
              }}
            >
              {/* Noise dissolve */}
              <NoiseOverlay isActive={!!activePanel} />

              {/* Shimmer sweep */}
              <ShimmerEffect color={activeConfig.color} />

              {/* Top glow line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-px"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                style={{
                  background: `linear-gradient(90deg, transparent, ${activeConfig.color}, transparent)`,
                  boxShadow: `0 0 20px ${activeConfig.color}`,
                }}
              />

              {/* Corner accents — crystallization edges */}
              {[
                'top-3 left-3 border-l border-t rounded-tl-lg',
                'top-3 right-3 border-r border-t rounded-tr-lg',
                'bottom-3 left-3 border-l border-b rounded-bl-lg',
                'bottom-3 right-3 border-r border-b rounded-br-lg',
              ].map((cls, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-5 h-5 ${cls} opacity-40`}
                  style={{ borderColor: activeConfig.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                />
              ))}

              {/* Content */}
              <div className="h-full p-4 relative z-10">
                {renderPanelContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Dock Bar with Ambient Particle Field ── */}
      <div className="relative">
        <AmbientParticleField activePanel={activePanel} />

        <motion.div
          className="flex items-center justify-center gap-1 px-5 py-1.5 mx-auto w-fit rounded-t-2xl relative z-10"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 22, 36, 0.92) 0%, rgba(10, 14, 23, 0.96) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderBottom: 'none',
            boxShadow: '0 -6px 30px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          }}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
        >
          {PANELS.map((panel, i) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
            >
              <DockTrigger
                config={panel}
                isActive={activePanel === panel.id}
                onClick={() => togglePanel(panel.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
