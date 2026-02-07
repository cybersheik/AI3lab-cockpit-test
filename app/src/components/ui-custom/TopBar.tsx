import { motion } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Settings, 
  Eye, 
  EyeOff,
  Monitor,
  Globe,
  Lock,
  User,
  FlaskConical,
  Maximize,
  Minimize
} from 'lucide-react';
import { useAppStore, workModes } from '@/store/appStore';
import type { WorkModeType } from '@/types';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const workModeConfig: Record<WorkModeType, { icon: typeof Globe; label: string; color: string; borderColor: string }> = {
  open: { icon: Globe, label: 'Open Discussion', color: '#2196F3', borderColor: 'border-blue-500' },
  closed: { icon: Lock, label: 'Closed Loop', color: '#9C27B0', borderColor: 'border-purple-500' },
  review: { icon: User, label: 'Human Review', color: '#FF5722', borderColor: 'border-orange-500' },
};

export function TopBar() {
  const { 
    currentMode, 
    currentIteration, 
    sessionDuration, 
    isPlaying, 
    togglePlay,
    reducedMotion,
    highContrast,
    toggleReducedMotion,
    toggleHighContrast,
    workMode,
    setWorkMode,
    sessionTitle,
    sessionStartTime,
    isFullscreen,
    toggleFullscreen,
  } = useAppStore();
  
  const { formatDuration, getSessionPhase } = useSessionTimer();

  const mode = workModes.find(m => m.id === currentMode);
  const sessionInfo = getSessionPhase(sessionDuration);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2"
    >
      <div className="glass-panel-strong mx-auto max-w-[1920px]">
        {/* Row 1: Branding + Session Title */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            {/* AI³ Venture Engine Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6C56FF] to-[#9C27B0] flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI³</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-semibold text-sm">AI³ Venture Engine</div>
                <div className="text-white/50 text-[10px]">Where Ideas Multiply</div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-white/20" />
            
            {/* AI³Lab Badge */}
            <div className="flex items-center gap-2">
              <FlaskConical size={16} className="text-[#FF9800]" />
              <div className="hidden sm:block">
                <div className="text-white font-medium text-sm">AI³Lab</div>
                <div className="text-white/50 text-[10px]">Strategic Innovation Lab</div>
              </div>
            </div>
          </div>

          {/* Center: Session Title */}
          <div className="flex-1 text-center px-4">
            <div className="text-white/50 text-[10px] uppercase tracking-wider">Current Session</div>
            <div className="text-white font-medium text-sm truncate max-w-md mx-auto">
              {sessionTitle}
            </div>
          </div>

          {/* Right: Session Info + Fullscreen */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Started</div>
              <div className="text-white text-sm">{sessionStartTime}</div>
            </div>
            <div className="text-right">
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Iteration</div>
              <div className="text-white font-semibold text-sm">{currentIteration} <span className="text-white/50">/ 15</span></div>
            </div>
            
            {/* Fullscreen Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="w-8 h-8 rounded-full hover:bg-white/10 ml-2"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize size={16} className="text-white/70" />
              ) : (
                <Maximize size={16} className="text-white/70" />
              )}
            </Button>
          </div>
        </div>

        {/* Row 2: Controls + Mode Switcher */}
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Work Mode Switcher */}
          <div className="flex items-center gap-1">
            <span className="text-white/50 text-xs mr-2 hidden sm:inline">Mode:</span>
            {(Object.keys(workModeConfig) as WorkModeType[]).map((modeKey) => {
              const config = workModeConfig[modeKey];
              const Icon = config.icon;
              const isActive = workMode === modeKey;
              return (
                <button
                  key={modeKey}
                  onClick={() => setWorkMode(modeKey)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300",
                    isActive
                      ? `bg-white/15 text-white border border-white/20`
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                  style={isActive ? { borderColor: config.color } : {}}
                >
                  <Icon size={14} style={{ color: isActive ? config.color : undefined }} />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center: Phase Status */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Phase</div>
              <div className="text-white text-xs">{mode?.name}</div>
            </div>
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Session</div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-[#6C56FF]" />
                <span className="text-white text-xs">{formatDuration(sessionDuration)}</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/50 text-[10px] uppercase tracking-wider">Status</div>
              <span className="text-[#6C56FF] text-xs">{sessionInfo.phase}</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="w-8 h-8 rounded-full hover:bg-white/10"
            >
              {isPlaying ? (
                <Pause size={16} className="text-white" />
              ) : (
                <Play size={16} className="text-white" />
              )}
            </Button>

            {/* Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full hover:bg-white/10"
                >
                  <Settings size={16} className="text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 glass-panel-strong border-white/10"
              >
                <DropdownMenuLabel className="text-white/70">
                  Display Settings
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuItem
                  onClick={toggleReducedMotion}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  {reducedMotion ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                  {reducedMotion ? 'Enable Animations' : 'Reduced Motion'}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={toggleHighContrast}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  <Monitor size={14} className="mr-2" />
                  {highContrast ? 'Normal Contrast' : 'High Contrast'}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/10 cursor-pointer"
                >
                  {isFullscreen ? <Minimize size={14} className="mr-2" /> : <Maximize size={14} className="mr-2" />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10" />
                
                <DropdownMenuLabel className="text-white/70">
                  Session Info
                </DropdownMenuLabel>
                <div className="px-2 py-2 text-xs text-white/60">
                  <div className="flex justify-between mb-1">
                    <span>Phase:</span>
                    <span className="text-[#6C56FF]">{sessionInfo.phase}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Adaptation:</span>
                    <span className="text-[#6C56FF]">{sessionInfo.colorAdaptation}</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
