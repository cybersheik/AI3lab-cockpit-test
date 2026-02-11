import { useState, useEffect, useRef } from 'react';
import { Scene } from '@/components/three/Scene';
import { 
  TopBar, 
  BottomBar, 
  AgentBanner,
  LoadingScreen,
} from '@/components/ui-custom';
import { useAppStore } from '@/store/appStore';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { cn } from '@/lib/utils';
import './App.css';
import { AuthGate } from '@/components/ui-custom/AuthGate';

// === WINDOW-LEVEL SWIPE FOR CAROUSEL ===
// Catches touch events on window — bypasses ALL z-index issues.
// Only active when no banner is open.
function useSwipeCarousel() {
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const velocityX = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef<number>(0);
  const rotation = useRef(0);

  useEffect(() => {
    const getStore = () => useAppStore.getState();

    const momentum = () => {
      if (Math.abs(velocityX.current) > 0.0001) {
        rotation.current += velocityX.current;
        velocityX.current *= 0.95;
        getStore().setCarouselRotation(rotation.current);
        animFrame.current = requestAnimationFrame(momentum);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (getStore().bannerOpen) return;
      cancelAnimationFrame(animFrame.current);
      isDragging.current = true;
      lastX.current = e.touches[0].clientX;
      velocityX.current = 0;
      lastTime.current = Date.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastX.current;
      rotation.current += dx * 0.003;
      getStore().setCarouselRotation(rotation.current);
      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) velocityX.current = (dx * 0.003) / dt * 16;
      lastX.current = e.touches[0].clientX;
      lastTime.current = now;
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      if (Math.abs(velocityX.current) > 0.001) {
        animFrame.current = requestAnimationFrame(momentum);
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (getStore().bannerOpen) return;
      cancelAnimationFrame(animFrame.current);
      isDragging.current = true;
      lastX.current = e.clientX;
      velocityX.current = 0;
      lastTime.current = Date.now();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      rotation.current += dx * 0.003;
      getStore().setCarouselRotation(rotation.current);
      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) velocityX.current = (dx * 0.003) / dt * 16;
      lastX.current = e.clientX;
      lastTime.current = now;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      if (Math.abs(velocityX.current) > 0.001) {
        animFrame.current = requestAnimationFrame(momentum);
      }
    };

    // Window-level — catches everything
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      cancelAnimationFrame(animFrame.current);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    highContrast, 
    bannerOpen, 
    bannerAgentId, 
    closeBanner,
    setBannerPanel,
  } = useAppStore();

  // Session timer
  useSessionTimer();

  // Window-level swipe for carousel
  useSwipeCarousel();

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const panels = ['chat', 'prompts', 'metrics'] as const;
        const panelIndex = parseInt(e.key) - 1;
        if (panels[panelIndex]) {
          setBannerPanel(panels[panelIndex]);
        }
      }
      if (e.key === 'Escape' && bannerOpen) {
        closeBanner();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bannerOpen, closeBanner, setBannerPanel]);

  // Prevent context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
    <AuthGate>
    <div 
      className={cn(
        'relative w-screen h-screen overflow-hidden',
        highContrast && 'high-contrast'
      )}
      style={{
        background: highContrast 
          ? '#000000' 
          : 'linear-gradient(180deg, #0A0E17 0%, #0D1320 100%)',
      }}
    >
      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Main 3D Scene */}
      <Scene className="absolute inset-0" />

      {/* UI Overlay */}
      {!isLoading && (
        <>
          <TopBar />
          <BottomBar />
          {bannerOpen && bannerAgentId && (
            <AgentBanner 
              agentId={bannerAgentId} 
              onClose={closeBanner} 
            />
          )}
        </>
      )}

      {/* Ambient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 14, 23, 0.3) 100%)',
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
    </AuthGate>
  );
}

export default App;
