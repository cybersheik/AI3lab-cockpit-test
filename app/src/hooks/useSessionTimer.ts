import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/appStore';

export function useSessionTimer() {
  const { isPlaying, incrementSessionTime } = useAppStore();

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      incrementSessionTime();
    }, 60000); // Increment every minute

    return () => clearInterval(interval);
  }, [isPlaying, incrementSessionTime]);

  const formatDuration = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  }, []);

  const getSessionPhase = useCallback((minutes: number): {
    phase: string;
    colorAdaptation: string;
  } => {
    if (minutes < 120) {
      return {
        phase: 'Fresh',
        colorAdaptation: 'Full vibrant palette',
      };
    } else if (minutes < 240) {
      return {
        phase: 'Focused',
        colorAdaptation: 'Slightly desaturated',
      };
    } else if (minutes < 360) {
      return {
        phase: 'Deep Work',
        colorAdaptation: 'Muted tones',
      };
    } else {
      return {
        phase: 'Extended',
        colorAdaptation: 'Minimal stimulation',
      };
    }
  }, []);

  return {
    formatDuration,
    getSessionPhase,
  };
}
