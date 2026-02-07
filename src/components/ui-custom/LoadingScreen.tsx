import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FlaskConical } from 'lucide-react';

interface LoadingScreenProps {
  onComplete?: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    'Initializing AI³ Venture Engine...',
    'Loading AI³Lab environment...',
    'Establishing neural connections...',
    'Calibrating holographic displays...',
    'Powered by AI³Lab',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => onComplete?.(), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const phaseIndex = Math.min(Math.floor(progress / 20), phases.length - 1);
    setPhase(phaseIndex);
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0A0E17 0%, #0D1320 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-indigo-500/30"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              scale: [0, 1, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Central content */}
      <div className="relative z-10 text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {/* AI³ Logo */}
          <div className="w-28 h-28 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 sphere-glow">
            <span className="text-white font-bold text-4xl">AI³</span>
          </div>
          
          {/* Branding */}
          <h1 className="text-white text-2xl font-bold">AI³ Venture Engine</h1>
          <p className="text-white/50 text-sm mt-1">Where Ideas Multiply</p>
          
          {/* AI³Lab Badge */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <FlaskConical size={16} className="text-orange-400" />
              <span className="text-white/70 text-sm">AI³Lab</span>
              <span className="text-white/40 text-xs">Strategic Innovation Laboratory</span>
            </div>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="w-72 mx-auto mb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Phase text */}
        <motion.p
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-white/60 text-sm"
        >
          {phases[phase]}
        </motion.p>

        {/* Progress percentage */}
        <p className="text-white/40 text-xs mt-2">{progress}%</p>
      </div>

      {/* Decorative elements - Agent colors */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-green-500/50" />
        <div className="w-3 h-3 rounded-full bg-blue-500/50" />
        <div className="w-3 h-3 rounded-full bg-orange-500/50" />
        <div className="w-3 h-3 rounded-full bg-purple-500/50" />
      </div>
    </motion.div>
  );
}
