/**
 * AI³Lab TopBar — Kimi-style minimal navigation
 *
 * Single thin row: logo left, mode/status center, controls right.
 * JetBrains Mono typography, cyan→purple gradient logo, pulsing status dot.
 * Inspired by Kimi's ai3-navigator-v0.8 header pattern.
 */

import { motion } from 'framer-motion';
import {
  Globe,
  Lock,
  User,
  Maximize,
  Minimize,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAppStore, workModes } from '@/store/appStore';
import type { WorkModeType } from '@/types';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { cn } from '@/lib/utils';

const modeIcons: Record<WorkModeType, typeof Globe> = {
  open: Globe,
  closed: Lock,
  review: User,
};

const modeLabels: Record<WorkModeType, string> = {
  open: 'OPEN',
  closed: 'CLOSED',
  review: 'REVIEW',
};

export function TopBar() {
  const {
    currentMode,
    sessionDuration,
    workMode,
    setWorkMode,
    reducedMotion,
    toggleReducedMotion,
    isFullscreen,
    toggleFullscreen,
  } = useAppStore();

  const { formatDuration } = useSessionTimer();
  const mode = workModes.find(m => m.id === currentMode);


  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(180deg, rgba(13,15,26,0.85) 0%, rgba(13,15,26,0.4) 70%, transparent 100%)',
        borderBottom: '1px solid rgba(0,217,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between px-8 py-3 max-w-[1920px] mx-auto">

        {/* ── Left: Logo ── */}
        <div className="flex items-center gap-3 select-none">
          <img
            src="/ai3-logo.png"
            alt="AI³"
            className="h-7 w-7"
            style={{ filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.4))' }}
          />
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: 6,
              textTransform: 'uppercase' as const,
              background: 'linear-gradient(90deg, #00E5FF, #7B2D8E)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI³ Venture Engine
          </span>
        </div>

        {/* ── Center: Mode + Phase + Session ── */}
        <div className="flex items-center gap-6">
          {/* Mode switcher */}
          <div className="flex items-center gap-1.5">
            {(['open', 'closed', 'review'] as WorkModeType[]).map((m) => {
              const Icon = modeIcons[m];
              const isActive = workMode === m;
              return (
                <button
                  key={m}
                  onClick={() => setWorkMode(m)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded transition-all",
                    isActive
                      ? "bg-white/[0.08]"
                      : "bg-transparent hover:bg-white/[0.04]"
                  )}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: 3,
                    color: isActive ? '#00E5FF' : 'rgba(122,128,153,0.8)',
                  }}
                >
                  <Icon size={11} />
                  {modeLabels[m]}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08]" />

          {/* Phase */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: 2,
              color: 'rgba(122,128,153,0.8)',
            }}
          >
            <span style={{ color: 'rgba(122,128,153,0.5)' }}>PHASE </span>
            <span style={{ color: '#e8eaf0' }}>{mode?.name || 'Exploration'}</span>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-white/[0.08]" />

          {/* Session timer */}
          <div className="flex items-center gap-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: 2,
              color: 'rgba(122,128,153,0.8)',
            }}
          >
            <span style={{ color: 'rgba(122,128,153,0.5)' }}>SESSION </span>
            <span style={{ color: '#e8eaf0' }}>{formatDuration(sessionDuration)}</span>
          </div>

          {/* Status dot */}
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#00E5FF',
              boxShadow: '0 0 8px #00E5FF, 0 0 16px rgba(0,229,255,0.3)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* ── Right: Controls ── */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleReducedMotion}
            className="p-1.5 rounded hover:bg-white/[0.06] transition-colors"
            title={reducedMotion ? 'Enable Motion' : 'Reduce Motion'}
          >
            {reducedMotion
              ? <EyeOff size={13} className="text-white/30" />
              : <Eye size={13} className="text-white/30" />
            }
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-white/[0.06] transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen
              ? <Minimize size={13} className="text-white/30" />
              : <Maximize size={13} className="text-white/30" />
            }
          </button>
        </div>
      </div>

      {/* Pulse dot keyframe */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
      `}</style>
    </motion.header>
  );
}
