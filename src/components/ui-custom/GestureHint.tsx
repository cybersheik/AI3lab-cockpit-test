import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Move, ZoomIn, RotateCw } from 'lucide-react';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

export function GestureHint() {
  const { isTouch } = useDeviceCapabilities();
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 8 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible || dismissed || !isTouch) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-28 left-1/2 -translate-x-1/2 z-30"
      >
        <div className="glass-panel px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Hand size={18} className="text-white/60" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Touch Controls</p>
                <p className="text-white/50 text-xs">Navigate the 3D space</p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1">
                <Move size={16} className="text-indigo-400" />
                <span className="text-white/50 text-[10px]">Pan</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ZoomIn size={16} className="text-purple-400" />
                <span className="text-white/50 text-[10px]">Pinch</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCw size={16} className="text-blue-400" />
                <span className="text-white/50 text-[10px]">Rotate</span>
              </div>
            </div>

            <button
              onClick={() => setDismissed(true)}
              className="ml-2 text-white/40 hover:text-white/80 text-xs"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
