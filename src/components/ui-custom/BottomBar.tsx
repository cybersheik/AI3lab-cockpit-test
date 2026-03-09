/**
 * AI³Lab BottomBar — Terrain Intelligence
 *
 * Philosophy: A living particle-mesh landscape occupies the bottom of the screen.
 * Perlin-noise terrain of cyan/orange dots forms a "cockpit dashboard" surface.
 * Panel instruments stand ON this terrain in CSS perspective — receding into depth.
 * The carousel & Möbius ring float above, unobstructed.
 *
 * Key insight from LD: "почему картинки цифровой визуализации не могут быть столом
 * для инструментов панелей? научись рисовать перспективу."
 */

import { useState, useRef, useCallback, useEffect } from 'react';
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
  { id: 'comms',    icon: Radio,     label: 'Comm',    color: '#00E5FF', glowColor: 'rgba(0, 229, 255, 0.5)' },
  { id: 'terminal', icon: Terminal,  label: 'Code',    color: '#4CAF50', glowColor: 'rgba(76, 175, 80, 0.5)' },
  { id: 'input',    icon: Keyboard,  label: 'Input',   color: '#FFFFFF', glowColor: 'rgba(255, 255, 255, 0.3)' },
  { id: 'notebook', icon: BookOpen,  label: 'Notes',   color: '#FFC107', glowColor: 'rgba(255, 193, 7, 0.5)' },
];

// Carousel math (mirrors AgentCarousel.tsx)
const circleAgents = ['creator', 'red-team', 'co-creator'];
const agentAngles = circleAgents.map((_, i) => (i / circleAgents.length) * Math.PI * 2 - Math.PI / 2);

// ─── PARTICLE TERRAIN ─────────────────────────────────
// Living mesh landscape — noise-driven dot grid with connecting lines.
// Rendered via Canvas 2D for performance, separate from the Three.js scene.

function ParticleTerrain({ activePanel }: { activePanel: PanelId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);

  // Simple 2D Perlin-like noise
  const noise2D = useCallback((x: number, y: number, t: number) => {
    const s1 = Math.sin(x * 0.8 + t * 0.3) * Math.cos(y * 0.6 + t * 0.2);
    const s2 = Math.sin(x * 1.5 + y * 0.9 - t * 0.15) * 0.5;
    const s3 = Math.cos(x * 0.3 - y * 1.2 + t * 0.25) * 0.3;
    return (s1 + s2 + s3) / 1.8;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const activePanelIndex = activePanel
      ? PANELS.findIndex(p => p.id === activePanel)
      : -1;

    const render = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cols = 48;
      const rows = 14;
      const spacingX = rect.width / (cols - 1);
      const spacingY = rect.height / (rows - 1);

      // Build point grid with noise displacement
      const points: Array<{ x: number; y: number; z: number; col: number; row: number }> = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = col * spacingX;
          const baseY = row * spacingY;

          // Noise-driven height
          const n = noise2D(col * 0.25, row * 0.35, t);
          const height = n * 18;

          // Active panel creates a "hill" under its position
          let panelInfluence = 0;
          if (activePanelIndex >= 0) {
            const panelX = (activePanelIndex + 0.5) / PANELS.length;
            const dx = (col / cols) - panelX;
            const dy = (row / rows) - 0.5;
            const dist = Math.sqrt(dx * dx * 4 + dy * dy);
            panelInfluence = Math.max(0, 1 - dist * 3) * 12 * Math.sin(t * 2 + dist * 5) * 0.3;
            panelInfluence += Math.max(0, 1 - dist * 2.5) * 8;
          }

          points.push({
            x: baseX,
            y: baseY - height - panelInfluence,
            z: n,
            col,
            row,
          });
        }
      }

      // Draw mesh lines
      ctx.lineWidth = 0.5;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const p = points[idx];
          const alpha = 0.06 + Math.abs(p.z) * 0.12;

          // Horizontal lines
          if (col < cols - 1) {
            const next = points[idx + 1];
            ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
          }

          // Vertical lines
          if (row < rows - 1) {
            const below = points[idx + cols];
            const purpleAlpha = 0.04 + Math.abs(p.z) * 0.08;
            ctx.strokeStyle = `rgba(123, 45, 142, ${purpleAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(below.x, below.y);
            ctx.stroke();
          }
        }
      }

      // Draw dots
      for (const p of points) {
        const brightness = 0.3 + Math.abs(p.z) * 0.7;
        const size = 1 + Math.abs(p.z) * 1.5;

        // Color based on height: cyan (high) → orange (low)
        const isCyan = p.z > 0;
        if (isCyan) {
          ctx.fillStyle = `rgba(0, 229, 255, ${brightness * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(255, 107, 43, ${brightness * 0.6})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow on prominent points
        if (Math.abs(p.z) > 0.5) {
          ctx.fillStyle = isCyan
            ? `rgba(0, 229, 255, ${brightness * 0.15})`
            : `rgba(255, 107, 43, ${brightness * 0.1})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activePanel, noise2D]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.85 }}
    />
  );
}

// ─── TERRAIN INSTRUMENT (panel card on the landscape) ─
function TerrainInstrument({
  config,
  isActive,
  onClick,
  index,
  total,
}: {
  config: PanelConfig;
  isActive: boolean;
  onClick: () => void;
  index: number;
  total: number;
}) {
  const Icon = config.icon;
  // Position across terrain width
  const leftPercent = ((index + 0.5) / total) * 100;

  return (
    <motion.button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-1 group"
      style={{
        left: `${leftPercent}%`,
        bottom: isActive ? '50%' : '30%',
        transform: 'translateX(-50%)',
        zIndex: isActive ? 20 : 10 - index,
      }}
      animate={{
        bottom: isActive ? '50%' : '30%',
        scale: isActive ? 1.15 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: isActive ? 1.15 : 1.08 }}
    >
      {/* Glass card */}
      <motion.div
        className="relative rounded-xl px-3 py-2.5 flex flex-col items-center gap-1.5 cursor-pointer"
        style={{
          background: isActive
            ? `linear-gradient(180deg, ${config.color}18 0%, rgba(10,10,15,0.85) 100%)`
            : 'rgba(10, 10, 15, 0.6)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${isActive ? config.color + '50' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isActive
            ? `0 0 30px ${config.glowColor}, 0 8px 32px rgba(0,0,0,0.5)`
            : '0 4px 16px rgba(0,0,0,0.3)',
          minWidth: 56,
        }}
      >
        {/* Active glow line on top */}
        {isActive && (
          <motion.div
            className="absolute top-0 left-2 right-2 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
            }}
            layoutId="terrainGlow"
          />
        )}

        <Icon
          size={18}
          style={{ color: isActive ? config.color : 'rgba(255,255,255,0.5)' }}
          className="transition-colors duration-300"
        />

        <span
          className="text-[9px] font-medium tracking-wider uppercase"
          style={{ color: isActive ? config.color : 'rgba(255,255,255,0.35)' }}
        >
          {config.label}
        </span>
      </motion.div>

      {/* "Stem" connecting card to terrain */}
      <motion.div
        className="w-px"
        style={{
          height: isActive ? 24 : 12,
          background: `linear-gradient(to bottom, ${isActive ? config.color + '60' : 'rgba(255,255,255,0.1)'}, transparent)`,
        }}
        animate={{ height: isActive ? 24 : 12 }}
        transition={{ type: 'spring', stiffness: 200 }}
      />

      {/* Dot on terrain surface */}
      <motion.div
        className="rounded-full"
        style={{
          width: isActive ? 6 : 3,
          height: isActive ? 6 : 3,
          backgroundColor: isActive ? config.color : 'rgba(0, 229, 255, 0.4)',
          boxShadow: isActive ? `0 0 12px ${config.color}` : 'none',
        }}
        animate={{
          width: isActive ? 6 : 3,
          height: isActive ? 6 : 3,
        }}
      />
    </motion.button>
  );
}

// ─── CAROUSEL PANEL ───────────────────────────────────
function CarouselPanel({
  onAgentTap,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onClose,
}: {
  onAgentTap: (id: string) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onClose: () => void;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <CircleDot size={14} className="text-[#6C56FF]" />
          Agent Carousel
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>
      <div
        className="flex-1 overflow-x-auto flex items-center gap-3 px-2"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {agents.map((agent) => (
          <motion.button
            key={agent.id}
            onClick={() => onAgentTap(agent.id)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
              style={{
                background: `radial-gradient(circle, ${agent.color}35, transparent)`,
                border: `1px solid ${agent.color}50`,
              }}
            >
              {agent.icon}
            </div>
            <span className="text-[10px] text-white/60 whitespace-nowrap">{agent.name}</span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: agent.status === 'active' ? agent.color : 'rgba(255,255,255,0.15)' }}
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── COMM PANEL ───────────────────────────────────────
function CommPanel({ onClose }: { onClose: () => void }) {
  const logs = defaultCommunicationLogs;
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <Radio size={14} className="text-[#00E5FF]" />
          Communications
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>
      <div className="flex-1 overflow-auto space-y-1.5">
        {logs.slice(-6).map((log, i) => (
          <motion.div
            key={log.id}
            className="flex gap-2 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <ChevronRight size={10} className="text-cyan-400/40 mt-1 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-white/35">
                {log.from} → {log.to}
              </p>
              <p className="text-xs text-white/70 truncate">{log.message}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── TERMINAL PANEL ───────────────────────────────────
function TerminalPanel({ onClose }: { onClose: () => void }) {
  const tabs = [
    { id: 'claude', name: 'Claude', color: '#00E5FF' },
    { id: 'gpt', name: 'GPT-4', color: '#10B981' },
    { id: 'qwen', name: 'Qwen', color: '#2196F3' },
  ];
  const [activeTab, setActiveTab] = useState('claude');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
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
      <div className="flex items-center justify-between mb-2">
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/80 font-medium text-sm flex items-center gap-2">
          <BookOpen size={14} className="text-[#FFC107]" />
          System Eyes
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={14} className="text-white/40" />
        </button>
      </div>
      <div className="flex gap-1.5 mb-2">
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
// MAIN COMPONENT — TERRAIN INTELLIGENCE
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
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* ── Terrain Zone — perspective container ── */}
      <div
        className="relative w-full pointer-events-auto"
        style={{
          height: '22vh',
          perspective: '800px',
          perspectiveOrigin: '50% 100%',
        }}
      >
        {/* Perspective-tilted terrain surface */}
        <div
          className="absolute inset-0"
          style={{
            transform: 'rotateX(55deg)',
            transformOrigin: 'bottom center',
          }}
        >
          <ParticleTerrain activePanel={activePanel} />
        </div>

        {/* Soft fade at very top edge */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: '15%',
            background: 'linear-gradient(to bottom, rgba(10, 14, 23, 0.6) 0%, transparent 100%)',
          }}
        />

        {/* ── Instrument cards standing on terrain ── */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: '80%' }}>
          {PANELS.map((panel, i) => (
            <TerrainInstrument
              key={panel.id}
              config={panel}
              isActive={activePanel === panel.id}
              onClick={() => togglePanel(panel.id)}
              index={i}
              total={PANELS.length}
            />
          ))}
        </div>

        {/* ── Expanded panel content ── */}
        <AnimatePresence>
          {activePanel && activeConfig && (
            <motion.div
              className="absolute left-1/2 bottom-[38%] z-30"
              style={{
                width: 'min(420px, 85vw)',
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  height: '240px',
                  background: 'linear-gradient(180deg, rgba(13, 19, 32, 0.96) 0%, rgba(10, 14, 23, 0.98) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${activeConfig.color}30`,
                  boxShadow: `0 -12px 40px ${activeConfig.glowColor}, 0 0 1px ${activeConfig.color}40, inset 0 1px 0 rgba(255,255,255,0.06)`,
                }}
              >
                {/* Top glow line */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-px"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  style={{
                    background: `linear-gradient(90deg, transparent, ${activeConfig.color}, transparent)`,
                    boxShadow: `0 0 15px ${activeConfig.color}`,
                  }}
                />
                {/* Content */}
                <div className="h-full p-4 relative z-10">
                  {renderPanelContent()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
