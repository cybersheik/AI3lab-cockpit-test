import { useState, useEffect, useRef } from 'react';
import { Scene } from '@/components/three/Scene';
import { TopBar, BottomBar, AgentBanner, LoadingScreen } from '@/components/ui-custom';
import { useAppStore } from '@/store/appStore';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { cn } from '@/lib/utils';
import './App.css';

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
    const onTS = (e: TouchEvent) => {
      if (getStore().bannerOpen) return;
      cancelAnimationFrame(animFrame.current);
      isDragging.current = true; lastX.current = e.touches[0].clientX;
      velocityX.current = 0; lastTime.current = Date.now();
    };
    const onTM = (e: TouchEvent) => {
      if (!isDragging.current) return;
      const dx = e.touches[0].clientX - lastX.current;
      rotation.current += dx * 0.003;
      getStore().setCarouselRotation(rotation.current);
      const now = Date.now(); const dt = now - lastTime.current;
      if (dt > 0) velocityX.current = (dx * 0.003) / dt * 16;
      lastX.current = e.touches[0].clientX; lastTime.current = now;
    };
    const onTE = () => { isDragging.current = false;
      if (Math.abs(velocityX.current) > 0.001) animFrame.current = requestAnimationFrame(momentum);
    };
    const onMD = (e: MouseEvent) => {
      if (getStore().bannerOpen) return;
      cancelAnimationFrame(animFrame.current);
      isDragging.current = true; lastX.current = e.clientX;
      velocityX.current = 0; lastTime.current = Date.now();
    };
    const onMM = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      rotation.current += dx * 0.003;
      getStore().setCarouselRotation(rotation.current);
      const now = Date.now(); const dt = now - lastTime.current;
      if (dt > 0) velocityX.current = (dx * 0.003) / dt * 16;
      lastX.current = e.clientX; lastTime.current = now;
    };
    const onMU = () => { if (!isDragging.current) return; isDragging.current = false;
      if (Math.abs(velocityX.current) > 0.001) animFrame.current = requestAnimationFrame(momentum);
    };
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchmove', onTM, { passive: true });
    window.addEventListener('touchend', onTE);
    window.addEventListener('mousedown', onMD);
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup', onMU);
    return () => { cancelAnimationFrame(animFrame.current);
      window.removeEventListener('touchstart', onTS); window.removeEventListener('touchmove', onTM);
      window.removeEventListener('touchend', onTE); window.removeEventListener('mousedown', onMD);
      window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU);
    };
  }, []);
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { highContrast, bannerOpen, bannerAgentId, closeBanner, setBannerPanel } = useAppStore();
  useSessionTimer();
  useSwipeCarousel();
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && ['1','2','3'].includes(e.key)) { e.preventDefault();
        const p = ['chat','prompts','metrics'] as const; if (p[+e.key-1]) setBannerPanel(p[+e.key-1]); }
      if (e.key === 'Escape' && bannerOpen) closeBanner();
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [bannerOpen, closeBanner, setBannerPanel]);
  useEffect(() => {
    const h = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', h); return () => document.removeEventListener('contextmenu', h);
  }, []);
  return (
    <div className={cn('relative w-screen h-screen overflow-hidden', highContrast && 'high-contrast')}
      style={{ background: highContrast ? '#000' : 'linear-gradient(180deg, #0A0E17 0%, #0D1320 100%)' }}>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <Scene className="absolute inset-0" />
      {!isLoading && (<>
        <TopBar />
        <BottomBar />
        {bannerOpen && bannerAgentId && <AgentBanner agentId={bannerAgentId} onClose={closeBanner} />}
      </>)}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10,14,23,0.3) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 150px rgba(0,0,0,0.5)' }} />
    </div>
  );
}
export default App;
