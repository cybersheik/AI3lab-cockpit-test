import { useState, useEffect } from 'react';
import { Scene } from '@/components/three/Scene';
import { 
  TopBar, 
  BottomBar, 
  DoDTracker,
  RightSidebar,
  AgentBanner,
  ModeIndicator,
  LoadingScreen,
  GestureHint 
} from '@/components/ui-custom';
import { useAppStore } from '@/store/appStore';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { cn } from '@/lib/utils';
import './App.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    highContrast, 
    bannerOpen, 
    bannerAgentId, 
    closeBanner,
    setBannerPanel,
  } = useAppStore();

  // Initialize session timer
  useSessionTimer();

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+1/2/3 - Banner panel switch
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        const panels = ['metrics', 'chat', 'summary'] as const;
        const panelIndex = parseInt(e.key) - 1;
        if (panels[panelIndex]) {
          setBannerPanel(panels[panelIndex]);
        }
      }
      
      // Esc - Close banner
      if (e.key === 'Escape' && bannerOpen) {
        closeBanner();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bannerOpen, closeBanner, setBannerPanel]);

  // Prevent context menu on right-click for better 3D experience
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  return (
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
          {/* Top Bar - Branding + Session Context + Work Modes */}
          <TopBar />

          {/* Left Sidebar - DoD Tracker */}
          <DoDTracker />

          {/* Right Sidebar - Communication Log + Session Context */}
          <RightSidebar />

          {/* Bottom Bar - Human Input Panel */}
          <BottomBar />

          {/* Agent Banner (when agent selected) */}
          {bannerOpen && bannerAgentId && (
            <AgentBanner 
              agentId={bannerAgentId} 
              onClose={closeBanner} 
            />
          )}

          {/* Mode Indicator */}
          <ModeIndicator />

          {/* Gesture Hint for touch devices */}
          <GestureHint />

          {/* Keyboard shortcuts hint */}
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 opacity-0 hover:opacity-100 transition-opacity">
            <div className="glass-panel px-4 py-2 text-center">
              <div className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Keyboard Shortcuts</div>
              <div className="text-white/60 text-xs space-x-3">
                <span>Ctrl+1/2/3 Panels</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Ambient overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 14, 23, 0.3) 100%)',
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 150px rgba(0, 0, 0, 0.5)',
        }}
      />
    </div>
  );
}

export default App;
