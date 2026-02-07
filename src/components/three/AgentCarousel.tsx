import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, agents } from '@/store/appStore';
import { Sprout, Zap, Flame, Waves } from 'lucide-react';

// Icons for each agent
const iconComponents = {
  Sprout,
  Zap,
  Flame,
  Waves,
};

// Agent positions in a circle (excluding coordinator which is in center)
const circleAgents = ['creator', 'red-team', 'co-creator'];
const circleRadius = 4;

interface AgentCarouselProps {
  onAgentClick?: (agentId: string) => void;
}

export function AgentCarousel({ onAgentClick }: AgentCarouselProps) {
  const groupRef = useRef<THREE.Group>(null);
  const carouselRef = useRef<THREE.Group>(null);
  const coordinatorRef = useRef<THREE.Group>(null);
  const { bannerOpen, isCarouselAnimating, setCarouselAnimating, reducedMotion } = useAppStore();
  const [targetRotation, setTargetRotation] = useState<number | null>(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);

  // Calculate positions for circle agents
  const circlePositions = useMemo(() => {
    return circleAgents.map((agentId, index) => {
      const angle = (index / circleAgents.length) * Math.PI * 2 - Math.PI / 2;
      return {
        agentId,
        angle,
        x: Math.cos(angle) * circleRadius,
        z: Math.sin(angle) * circleRadius,
      };
    });
  }, []);

  // Get coordinator agent
  const coordinatorAgent = agents.find(a => a.id === 'coordinator');

  // Create connection line geometry
  const connectionGeometries = useMemo(() => {
    return circlePositions.map(({ x, z }) => {
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array([0, 0, 0, -x, 0, -z]);
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      return geometry;
    });
  }, [circlePositions]);

  // Animation for carousel rotation
  useFrame((state, delta) => {
    if (!carouselRef.current) return;

    // Handle target rotation (when user clicks an agent)
    if (targetRotation !== null && carouselRef.current) {
      const currentRotation = carouselRef.current.rotation.y;
      const diff = targetRotation - currentRotation;
      
      // Normalize diff to -PI to PI
      const normalizedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      
      if (Math.abs(normalizedDiff) > 0.01) {
        carouselRef.current.rotation.y += normalizedDiff * delta * 5;
      } else {
        carouselRef.current.rotation.y = targetRotation;
        setTargetRotation(null);
        setCarouselAnimating(false);
      }
    }

    // Floating animation for coordinator (when visible and not banner open)
    if (coordinatorRef.current && !bannerOpen && !reducedMotion) {
      coordinatorRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
      coordinatorRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Handle agent click with carousel rotation
  const handleAgentClick = (agentId: string, index: number) => {
    if (isCarouselAnimating) return;
    
    setCarouselAnimating(true);
    setSelectedAgentIndex(index);
    
    // Calculate rotation to bring clicked agent to front (angle 0)
    const currentAngle = circlePositions[index].angle;
    const rotationNeeded = -currentAngle;
    setTargetRotation(rotationNeeded);
    
    // Open banner after rotation
    setTimeout(() => {
      onAgentClick?.(agentId);
    }, 600);
  };

  return (
    <group ref={groupRef}>
      {/* Center Coordinator (completely hidden when banner opens) */}
      {coordinatorAgent && !bannerOpen && (
        <group ref={coordinatorRef} position={[0, 0, 0]}>
          {/* Coordinator platform */}
          <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[1.5, 32]} />
            <meshBasicMaterial
              color={coordinatorAgent.color}
              transparent
              opacity={0.8}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Coordinator ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.5, 32]} />
            <meshBasicMaterial
              color={coordinatorAgent.color}
              transparent
              opacity={0.6}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Coordinator glow */}
          <mesh>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshBasicMaterial
              color={coordinatorAgent.color}
              transparent
              opacity={0.15}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Clickable area for Coordinator */}
          <mesh
            onClick={() => onAgentClick?.('coordinator')}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
          >
            <sphereGeometry args={[1.6, 16, 16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          {/* Coordinator HTML Label */}
          <Html
            position={[0, 2, 0]}
            center
            distanceFactor={8}
            style={{
              pointerEvents: 'auto',
              userSelect: 'none',
              cursor: 'pointer',
            }}
          >
            <div
              className="glass-panel px-4 py-2 text-center cursor-pointer hover:scale-105 transition-transform"
              onClick={() => onAgentClick?.('coordinator')}
              style={{
                borderColor: coordinatorAgent.color,
                boxShadow: `0 0 30px ${coordinatorAgent.glowColor}`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap size={18} color={coordinatorAgent.color} />
                <span className="text-lg font-bold" style={{ color: coordinatorAgent.color }}>
                  {coordinatorAgent.role}
                </span>
              </div>
              <div className="text-white text-base font-medium">{coordinatorAgent.name}</div>
              <div className="text-white/60 text-xs mt-1">{coordinatorAgent.description}</div>
              <div
                className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: `${coordinatorAgent.color}30`,
                  color: coordinatorAgent.color,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: coordinatorAgent.color }}
                />
                {coordinatorAgent.status}
              </div>
            </div>
          </Html>
        </group>
      )}

      {/* Rotating Carousel with 3 agents */}
      <group ref={carouselRef}>
        {circlePositions.map(({ agentId, x, z }, index) => {
          const agent = agents.find(a => a.id === agentId);
          if (!agent) return null;

          const IconComponent = iconComponents[agent.icon as keyof typeof iconComponents];
          const isSelected = selectedAgentIndex === index;

          return (
            <group key={agentId} position={[x, 0, z]}>
              {/* Agent platform */}
              <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 32]} />
                <meshBasicMaterial
                  color={agent.color}
                  transparent
                  opacity={0.3}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>

              {/* Inner ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 1.0, 32]} />
                <meshBasicMaterial
                  color={agent.color}
                  transparent
                  opacity={0.5}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Selection glow */}
              {isSelected && (
                <mesh>
                  <sphereGeometry args={[1.5, 32, 32]} />
                  <meshBasicMaterial
                    color={agent.color}
                    transparent
                    opacity={0.2}
                    blending={THREE.AdditiveBlending}
                    side={THREE.BackSide}
                  />
                </mesh>
              )}

              {/* Clickable area */}
              <mesh
                onClick={() => handleAgentClick(agentId, index)}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
              >
                <sphereGeometry args={[1.3, 16, 16]} />
                <meshBasicMaterial
                  transparent
                  opacity={0}
                />
              </mesh>

              {/* HTML Label */}
              <Html
                position={[0, 1.8, 0]}
                center
                distanceFactor={8}
                style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                <div
                  className="glass-panel px-3 py-2 text-center cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handleAgentClick(agentId, index)}
                  style={{
                    borderColor: agent.color,
                    boxShadow: isSelected ? `0 0 30px ${agent.glowColor}` : `0 0 15px ${agent.glowColor}`,
                  }}
                >
                  <div className="flex items-center justify-center gap-1.5 mb-1">
                    {IconComponent && <IconComponent size={14} color={agent.color} />}
                    <span className="text-sm font-semibold" style={{ color: agent.color }}>
                      {agent.role}
                    </span>
                  </div>
                  <div className="text-white text-sm font-medium">{agent.name}</div>
                </div>
              </Html>

              {/* Connection line to center */}
              <lineSegments geometry={connectionGeometries[index]}>
                <lineBasicMaterial
                  color={agent.color}
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                />
              </lineSegments>
            </group>
          );
        })}
      </group>
    </group>
  );
}
