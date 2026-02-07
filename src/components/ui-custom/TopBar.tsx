import { motion } from 'framer-motion';
import {
  FlaskConical,
  Maximize,
  Minimize
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { Button } from '@/components/ui/button';

export function TopBar() {
  const {
    currentIteration,
    sessionTitle,
    sessionStartTime,
    isFullscreen,
    toggleFullscreen,
  } = useAppStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-2"
    >
      <div className="glass-panel-strong mx-auto max-w-[1920px]">
        {/* Row 1: Branding + Session Title */}
        <div className="flex items-center justify-between px-4 py-2">
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
      </div>
    </motion.header>
  );
}
