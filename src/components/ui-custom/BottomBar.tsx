/**
 * AI³Lab BottomBar — Orbital Segments
 *
 * Philosophy: Panels are not stacked rectangles — they are peripheral floating segments
 * orbiting the scene. Each panel occupies its own spatial zone: left, right, top-right,
 * bottom-left, or a narrow bottom strip. The 3D carousel and Möbius ring are NEVER obscured.
 *
 * The dock is a miniature centered capsule (icons only, with glow).
 * Panels drift, breathe, and pulse — they are part of the scene, not UI overlays.
 *
 * Inspired by Kimi's micro-HUD (04), brand-integrated glass (02), and the Design Spine
 * non-negotiables: panels serve the scene, never dominate.
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

// ─── ORBITAL POSITION MAP ─────────────────────────────
// Each panel has a unique peripheral zone so nothing overlaps the center scene.
type OrbitalZone = 'bottom-left' | 'right' | 'left' | 'bottom-strip' | 'top-right';

const ORBITAL_ZONES: Record<Exclude<PanelId, null>, OrbitalZone> = {
  carousel: 'bottom-left',
  comms: 'right',
  terminal: 'left',
  input: 'bottom-strip',
  notebook: 'top-right',
};

// CSS position + size for each zone
const ZONE_STYLES: Record<OrbitalZone, React.CSSProperties> = {
  'bottom-left': {
    position: 'fixed',
    bottom: '72px',
    left: '12px',
    width: '280px',
    maxHeight: '220px',
  },
  right: {
    position: 'fixed',
    top: '50%',
    right: '12px',
    width: '200px',
    maxHeight: '320px',
    transform: 'translateY(-50%)',
  },
  left: {
    position: 'fixed',
    top: '50%',
    left: '12px',
    width: '200px',
    maxHeight: '320px',
    transform: 'translateY(-50%)',
  },
  'bottom-strip': {
    position: 'fixed',
    bottom: '72px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(460px, calc(100vw - 24px))',
    maxHeight: '110px',
  },
  'top-right': {
    position: 'fixed',
    top: '80px',
    right: '12px',
    width: '240px',
    maxHeight: '260px',
  },
};

// Motion origin for each zone (panels emerge from their edge)
const ZONE_MOTION: Record<OrbitalZone, { initial: Record<string, string | number>; animate: Record<string, string | number>; exit: Record<string, string | number> }> = {
  'bottom-left': {
    initial: { opacity: 0, x: -40, scale: 0.9, filter: 'blur(12px)' },
    animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -30, scale: 0.95, filter: 'blur(8px)' },
  },
  right: {
    initial: { opacity: 0, x: 40, scale: 0.9, filter: 'blur(12px)' },
    animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, x: 30, scale: 0.95, filter: 'blur(8px)' },
  },
  left: {
    initial: { opacity: 0, x: -40, scale: 0.9, filter: 'blur(12px)' },
    animate: { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -30, scale: 0.95, filter: 'blur(8px)' },
  },
  'bottom-strip': {
    initial: { opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, y: 20, scale: 0.97, filter: 'blur(6px)' },
  },
  'top-right': {
    initial: { opacity: 0, x: 30, y: -20, scale: 0.9, filter: 'blur(12px)' },
    animate: { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, x: 20, y: -10, scale: 0.95, filter: 'blur(8px)' },
  },
};

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

// ─── EDGE GLOW ────────────────────────────────────────
// A thin glowing line on the edge closest to center — the panel's "connection" to the scene
function EdgeGlow({ color, zone }: { color: string; zone: OrbitalZone }) {
  const edgeClass = {
    'bottom-left': 'absolute top-0 right-0 w-px h-full',
    right: 'absolute top-0 left-0 w-px h-full',
    left: 'absolute top-0 right-0 w-px h-full',
    'bottom-strip': 'absolute top-0 left-0 right-0 h-px',
    'top-right': 'absolute bottom-0 left-0 w-full h-px',
  }[zone];

  const gradientDir = {
    'bottom-left': '180deg',
    right: '180deg',
    left: '180deg',
    'bottom-strip': '90deg',
    'top-right': '90deg',
  }[zone];

  return (
    <motion.div
      className={cn(edgeClass, 'pointer-events-none')}
      style={{
        background: `linear-gradient(${gradientDir}, transparent, ${color}, transparent)`,
        boxShadow: `0 0 12px ${color}80`,
      }}
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{ opacity: 0.7, scaleY: 1 }}
      transition={{ delay: 0.15, duration: 0.4 }}
    />
  );
}

// ─── BREATHING GLOW ───────────────────────────────────
// Subtle ambient pulse around the panel — alive, not static
function BreathingGlow({ color }: { color: string }) {
  return (
    <motion.div
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        boxShadow: `0 0 30px ${color}15, inset 0 0 20px ${color}05`,
      }}
      animate={{
        boxShadow: [
          `0 0 30px ${color}15, inset 0 0 20px ${color}05`,
          `0 0 45px ${color}25, inset 0 0 30px ${color}08`,
          `0 0 30px ${color}15, inset 0 0 20px ${color}05`,
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ─── CORNER ACCENTS ───────────────────────────────────
function CornerAccents({ color }: { color: string }) {
  return (
    <>
      {[
        'top-2 left-2 border-l border-t rounded-tl-lg',
        'top-2 right-2 border-r border-t rounded-tr-lg',
        'bottom-2 left-2 border-l border-b rounded-bl-lg',
        'bottom-2 right-2 border-r border-b rounded-br-lg',
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`absolute w-3 h-3 ${cls} pointer-events-none`}
          style={{ borderColor: `${color}50` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.2 + i * 0.04 }}
        />
      ))}
    </>
  );
}

// ─── DOCK TRIGGER ─────────────────────────────────────
function DockTrigger({
  config, isActive, onClick
}: {
  config: PanelConfig; isActive: boolean; onClick: () => void;
}) {
  const Icon = config.icon;

  return (
    <motion.button
      onClick={onClick}
      className="relative group flex items-center justify-center w-10 h-10 rounded-xl transition-all focus:outline-none"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.88 }}
    >
      {/* Glow ring on hover */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle, ${config.glowColor} 0%, transparent 70%)`,
          filter: 'blur(8px)',
        }}
      />

      {/* Active state ring */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-xl"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            style={{
              border: `1.5px solid ${config.color}60`,
              boxShadow: `0 0 16px ${config.glowColor}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <Icon
        size={17}
        color={isActive ? config.color : 'rgba(255,255,255,0.35)'}
        style={{ filter: isActive ? `drop-shadow(0 0 6px ${config.color})` : 'none' }}
      />

      {/* Bottom dot indicator */}
      <motion.div
        className="absolute -bottom-0.5 w-1 h-1 rounded-full"
        style={{ backgroundColor: config.color }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/70 font-medium text-[11px] flex items-center gap-1.5 tracking-wide">
          <CircleDot size={12} className="text-[#6C56FF]" />
          Avatars
        </h3>
        <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
          <X size={12} className="text-white/30" />
        </button>
      </div>

      <div
        className="flex flex-wrap items-center justify-center gap-3 py-2 rounded-xl flex-1"
        style={{ touchAction: 'none' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {agents.map((agent, i) => (
          <motion.button
            key={agent.id}
            onClick={() => onAgentTap(agent.id)}
            className="flex flex-col items-center gap-1 group"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.06, type: 'spring' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${agent.color}CC, ${agent.color}55)`,
                boxShadow: `0 0 12px ${agent.glowColor}`,
                border: `1px solid ${agent.color}60`,
              }}
            >
              <span className="text-white text-[10px] font-bold">{agent.name.charAt(0)}</span>
            </div>
            <div className="text-[8px] font-medium" style={{ color: agent.color }}>{agent.role}</div>
          </motion.button>
        ))}
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
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/70 font-medium text-[11px] flex items-center gap-1.5 tracking-wide">
          <Radio size={12} className="text-[#00BCD4]" />
          Comm Router
        </h3>
        <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
          <X size={12} className="text-white/30" />
        </button>
      </div>

      <div className="flex-1 overflow-auto space-y-1">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            className="p-2 rounded-lg bg-white/[0.03] border-l-[1.5px] border-[#00BCD4]/50"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            <div className="flex items-center gap-1 text-[9px] text-white/40 mb-0.5">
              <span>{log.from}</span>
              <ChevronRight size={8} />
              <span>{log.to}</span>
              <span className="ml-auto font-mono text-[8px]">{log.timestamp}</span>
            </div>
            <p className="text-white/70 text-[10px] leading-tight">{log.message}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── TERMINAL PANEL ───────────────────────────────────
function TerminalPanel({ onClose }: { onClose: () => void }) {
  const tabs = [
    { id: 'claude', name: 'Claude', color: '#4CAF50' },
    { id: 'gpt', name: 'GPT', color: '#FF5722' },
    { id: 'kimi', name: 'Kimi', color: '#6C56FF' },
    { id: 'qwen', name: 'Qwen', color: '#2196F3' },
  ];
  const [activeTab, setActiveTab] = useState('claude');

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white/70 font-medium text-[11px] flex items-center gap-1.5 tracking-wide">
          <Terminal size={12} className="text-[#4CAF50]" />
          Code
        </h3>
        <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
          <X size={12} className="text-white/30" />
        </button>
      </div>

      <div className="flex gap-0.5 mb-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-2 py-0.5 rounded-md text-[9px] font-medium transition-all",
              activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white/50"
            )}
            style={activeTab === tab.id ? { backgroundColor: `${tab.color}20` } : {}}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 p-2 rounded-lg bg-black/40 font-mono text-[10px] overflow-auto border border-white/[0.05]">
        <motion.p className="text-green-400/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          $ analyzing business_model.py
        </motion.p>
        <motion.p className="text-white/50 mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          Loading hypothesis validation...
        </motion.p>
        <motion.p className="text-blue-400/80 mt-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          → LTV:CAC ratio: 8.3 ✓
        </motion.p>
        <motion.p className="text-blue-400/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          → Churn rate: 12% ✓
        </motion.p>
        <motion.p className="text-yellow-400/80 mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
          ⚠ Enterprise segment underexplored
        </motion.p>
        <motion.p className="text-white/25 mt-1.5 animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
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
    <div className="h-full flex items-center gap-2 px-1">
      <div className="flex items-center gap-1.5 shrink-0">
        <Keyboard size={12} className="text-white/40" />
        <span className="text-white/50 text-[10px] font-medium">Input</span>
      </div>

      <input
        type="text"
        value={humanInput}
        onChange={(e) => setHumanInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && humanInput.trim()) sendHumanInput(); }}
        placeholder="Command, question, direction..."
        className="flex-1 h-8 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-[11px] placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
      />

      <button
        onClick={() => setIsRecording(!isRecording)}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
          isRecording ? "bg-red-500/25 animate-pulse" : "bg-white/[0.06] hover:bg-white/10"
        )}
      >
        <Mic size={13} className={isRecording ? "text-red-400" : "text-white/40"} />
      </button>

      <button
        onClick={sendHumanInput}
        disabled={!humanInput.trim()}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0",
          humanInput.trim()
            ? "bg-white/[0.12] hover:bg-white/[0.18] text-white"
            : "bg-white/[0.03] text-white/20 cursor-not-allowed"
        )}
      >
        <Send size={13} />
      </button>

      <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors shrink-0">
        <X size={11} className="text-white/25" />
      </button>
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
        <h3 className="text-white/70 font-medium text-[11px] flex items-center gap-1.5 tracking-wide">
          <BookOpen size={12} className="text-[#FFC107]" />
          System Eyes
        </h3>
        <button onClick={onClose} className="p-0.5 hover:bg-white/10 rounded-lg transition-colors">
          <X size={12} className="text-white/30" />
        </button>
      </div>

      <div className="flex gap-1 mb-2">
        {views.map((v) => {
          const VIcon = v.icon;
          return (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-all",
                activeView === v.id
                  ? "bg-[#FFC107]/15 text-[#FFC107]"
                  : "bg-white/[0.03] text-white/30 hover:text-white/50"
              )}
            >
              <VIcon size={10} />
              {v.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 rounded-xl bg-white/[0.02] overflow-auto p-2">
        {activeView === 'camera' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Camera size={24} className="mx-auto text-white/15 mb-2" />
              <p className="text-white/25 text-[10px]">Camera feed</p>
            </div>
          </div>
        )}

        {activeView === 'notes' && (
          <div className="space-y-1.5">
            {[
              { time: '14:35 — Iter 7', text: 'Focus shifted to enterprise pricing model. LTV:CAC looks promising.' },
              { time: '14:42 — Red Team', text: 'Identified risk: SMB segment may be underserved.' },
            ].map((note, i) => (
              <motion.div
                key={i}
                className="p-2 rounded-lg bg-white/[0.03]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08 }}
              >
                <p className="text-white/35 text-[9px] mb-0.5">{note.time}</p>
                <p className="text-white/70 text-[10px] leading-tight">{note.text}</p>
              </motion.div>
            ))}
          </div>
        )}

        {activeView === 'docs' && (
          <div className="grid grid-cols-2 gap-1">
            {['Business Model', 'Hypothesis Log', 'Run Config', 'Debrief'].map((doc, i) => (
              <motion.button
                key={doc}
                className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
              >
                <FileText size={10} className="text-white/25 mb-1" />
                <p className="text-white/60 text-[9px]">{doc}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// ORBITAL SEGMENT WRAPPER
// ═══════════════════════════════════════════════════════

function OrbitalSegment({
  panelId,
  config,
  children,
}: {
  panelId: Exclude<PanelId, null>;
  config: PanelConfig;
  children: React.ReactNode;
}) {
  const zone = ORBITAL_ZONES[panelId];
  const zoneStyle = ZONE_STYLES[zone];
  const motion_props = ZONE_MOTION[zone];

  return (
    <motion.div
      className="pointer-events-auto z-50"
      style={zoneStyle}
      initial={motion_props.initial}
      animate={{
        ...motion_props.animate,
        transition: {
          duration: 0.45,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      }}
      exit={{
        ...motion_props.exit,
        transition: { duration: 0.25 },
      }}
    >
      <div
        className="relative rounded-2xl overflow-hidden h-full"
        style={{
          background: 'linear-gradient(180deg, rgba(13, 19, 32, 0.93) 0%, rgba(10, 14, 23, 0.96) 100%)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${config.color}25`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 1px ${config.color}30`,
        }}
      >
        <BreathingGlow color={config.color} />
        <EdgeGlow color={config.color} zone={zone} />
        <CornerAccents color={config.color} />

        <div className="relative z-10 p-3 h-full">
          {children}
        </div>
      </div>
    </motion.div>
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

  return (
    <>
      {/* ── Scene Resonance Tint ── */}
      <AnimatePresence>
        {activePanel && activeConfig && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-40"
            style={{
              background: (() => {
                const zone = ORBITAL_ZONES[activeConfig.id];
                const origins: Record<OrbitalZone, string> = {
                  'bottom-left': '20% 90%',
                  right: '95% 50%',
                  left: '5% 50%',
                  'bottom-strip': '50% 95%',
                  'top-right': '90% 15%',
                };
                return `radial-gradient(ellipse at ${origins[zone]}, ${activeConfig.color}06 0%, transparent 50%)`;
              })(),
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* ── Orbital Panel Segments ── */}
      <AnimatePresence>
        {activePanel && activeConfig && (
          <OrbitalSegment panelId={activeConfig.id} config={activeConfig}>
            {activePanel === 'carousel' && (
              <CarouselPanel
                onAgentTap={rotateToAgent}
                onTouchStart={onPanelTouchStart}
                onTouchMove={onPanelTouchMove}
                onTouchEnd={onPanelTouchEnd}
                onClose={closePanel}
              />
            )}
            {activePanel === 'comms' && <CommPanel onClose={closePanel} />}
            {activePanel === 'terminal' && <TerminalPanel onClose={closePanel} />}
            {activePanel === 'input' && <InputPanel onClose={closePanel} />}
            {activePanel === 'notebook' && <NotebookPanel onClose={closePanel} />}
          </OrbitalSegment>
        )}
      </AnimatePresence>

      {/* ── Dock — miniature centered capsule ── */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          className="flex items-center gap-0.5 px-3 py-1.5 rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 22, 36, 0.88) 0%, rgba(10, 14, 23, 0.94) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
          }}
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, delay: 0.1 }}
        >
          {PANELS.map((panel, i) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 + i * 0.05 }}
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
    </>
  );
}
