import { useState, useEffect } from 'react';
import type { DeviceCapabilities } from '@/types';

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isTouch: false,
    isFoldable: false,
    screenSize: 'large',
    pixelRatio: 1,
    maxParticles: 500,
  });

  useEffect(() => {
    const detectCapabilities = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;
      
      // Detect touch
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Detect foldable (rough heuristic based on aspect ratio and device)
      const aspectRatio = Math.max(width, height) / Math.min(width, height);
      const isFoldable = aspectRatio > 2.2 || (width >= 700 && width <= 1100 && isTouch);
      
      // Screen size category
      let screenSize: DeviceCapabilities['screenSize'] = 'large';
      const minDimension = Math.min(width, height);
      if (minDimension < 600) {
        screenSize = 'small';
      } else if (minDimension < 900) {
        screenSize = 'medium';
      }
      
      // Max particles based on device capability
      let maxParticles = 500;
      if (screenSize === 'small') {
        maxParticles = 150;
      } else if (screenSize === 'medium') {
        maxParticles = 300;
      }
      
      // Further reduce for high pixel ratio devices
      if (pixelRatio > 2) {
        maxParticles = Math.floor(maxParticles * 0.7);
      }

      setCapabilities({
        isTouch,
        isFoldable,
        screenSize,
        pixelRatio,
        maxParticles,
      });
    };

    detectCapabilities();
    
    window.addEventListener('resize', detectCapabilities);
    window.addEventListener('orientationchange', detectCapabilities);
    
    return () => {
      window.removeEventListener('resize', detectCapabilities);
      window.removeEventListener('orientationchange', detectCapabilities);
    };
  }, []);

  return capabilities;
}

export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return orientation;
}
