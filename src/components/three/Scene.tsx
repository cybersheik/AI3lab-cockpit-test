import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { Starfield } from './Starfield';
import { IdeaCore } from './IdeaCore';
import { AgentCarousel } from './AgentCarousel';
// import { Timeline } from './Timeline';
import { KnowledgeParticles } from './KnowledgeParticles';
import { useAppStore } from '@/store/appStore';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

// Camera controller — mouse parallax + banner zoom only
// Z position in normal mode managed by useAutoCamera in AgentCarousel
function CameraController() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const { isTouch } = useDeviceCapabilities();
  const { reducedMotion, bannerOpen } = useAppStore();

  useEffect(() => {
    if (isTouch || reducedMotion || bannerOpen) return;

    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isTouch, reducedMotion, bannerOpen]);

  useFrame(() => {
    if (bannerOpen) {
      // Zoom out for banner
      camera.position.x += (0 - camera.position.x) * 0.05;
      camera.position.y += (2 - camera.position.y) * 0.05;
      camera.position.z += (14 - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);
      return;
    }

    if (reducedMotion || isTouch) return;

    // Mouse parallax (desktop only)
    targetRef.current.x += (mouseRef.current.x * 0.3 - targetRef.current.x) * 0.05;
    targetRef.current.y += (mouseRef.current.y * 0.2 - targetRef.current.y) * 0.05;

    camera.position.x = targetRef.current.x;
    camera.position.y = 2 + targetRef.current.y;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Ambient lighting setup
function Lighting() {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.3} color="#2D4178" />
      
      {/* Main directional light */}
      <directionalLight
        position={[5, 10, 7]}
        intensity={0.8}
        color="#FFFFFF"
        castShadow
      />
      
      {/* Point lights for each zone */}
      <pointLight
        position={[-4, 2, 0]}
        intensity={0.5}
        color="#4CAF50"
        distance={10}
      />
      <pointLight
        position={[0, 2, 2]}
        intensity={0.5}
        color="#2196F3"
        distance={10}
      />
      <pointLight
        position={[4, 2, 0]}
        intensity={0.5}
        color="#FF5722"
        distance={10}
      />
      <pointLight
        position={[0, 2, -3]}
        intensity={0.5}
        color="#9C27B0"
        distance={10}
      />
      
      {/* Central glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={1}
        color="#6C56FF"
        distance={15}
      />
    </>
  );
}

// Fog for depth
function SceneFog() {
  return (
    <fog
      attach="fog"
      args={['#0A0E17', 15, 50]}
    />
  );
}

// Main scene content
function SceneContent() {
  const { openBanner } = useAppStore();
  const { maxParticles } = useDeviceCapabilities();

  const handleAgentClick = (agentId: string) => {
    openBanner(agentId);
  };

  return (
    <>
      <CameraController />
      <Lighting />
      <SceneFog />
      
      {/* Background starfield */}
      <Starfield count={Math.min(maxParticles * 3, 1500)} />
      
      {/* Knowledge particles */}
      <KnowledgeParticles count={Math.floor(maxParticles * 0.4)} />
      
      {/* Central Idea Core */}
      <IdeaCore scale={1} />
      
      {/* Agent Carousel (4 icons in circle + center coordinator) */}
      <AgentCarousel onAgentClick={handleAgentClick} />
      
      {/* Timeline */}
      {/* <Timeline radius={5.5} /> */}
    </>
  );
}

// Post-processing effects
function PostProcessing() {
  const { reducedMotion } = useAppStore();

  return (
    <EffectComposer>
      <Bloom
        intensity={reducedMotion ? 0.5 : 1}
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        height={300}
      />
      <Noise
        opacity={reducedMotion ? 0.02 : 0.03}
      />
      <Vignette
        offset={0.3}
        darkness={0.5}
        eskil={false}
        blendFunction={2}
      />
    </EffectComposer>
  );
}

interface SceneProps {
  className?: string;
}

export function Scene({ className }: SceneProps) {
  // Camera FOV — useAutoCamera in AgentCarousel will override Z
  const fov = 60;

  return (
    <Canvas
      className={className}
      camera={{
        position: [0, 2, 10],
        fov,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
      style={{
        background: 'transparent',
        touchAction: 'none',
      }}
    >
      <SceneContent />
      <PostProcessing />
    </Canvas>
  );
}
