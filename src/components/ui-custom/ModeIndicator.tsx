import { motion } from 'framer-motion';
import { useAppStore, workModes } from '@/store/appStore';
import { Sprout, Search, GitMerge, CheckCircle } from 'lucide-react';

const modeIcons = {
  exploration: Sprout,
  refinement: Search,
  synthesis: GitMerge,
  validation: CheckCircle,
};

const modeColors = {
  exploration: '#4CAF50',
  refinement: '#FF5722',
  synthesis: '#9C27B0',
  validation: '#2196F3',
};

export function ModeIndicator() {
  const { currentMode, currentIteration } = useAppStore();
  
  const mode = workModes.find(m => m.id === currentMode);
  const Icon = modeIcons[currentMode as keyof typeof modeIcons];
  const color = modeColors[currentMode as keyof typeof modeColors];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-4 top-24 z-40"
    >
      <div 
        className="glass-panel p-4"
        style={{ borderLeft: `3px solid ${color}` }}
      >
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon size={20} style={{ color }} />}
          <span 
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color }}
          >
            {mode?.name}
          </span>
        </div>
        
        <p className="text-white/70 text-xs max-w-[200px] leading-relaxed">
          {mode?.description}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${((currentIteration - (mode?.iterations[0] || 1) + 1) / ((mode?.iterations[1] || 4) - (mode?.iterations[0] || 1) + 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <span className="text-white/50 text-xs">
            {currentIteration - (mode?.iterations[0] || 1) + 1} / {(mode?.iterations[1] || 4) - (mode?.iterations[0] || 1) + 1}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
