import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, agents } from '@/store/appStore';
import { Sprout, Zap, Flame, Waves } from 'lucide-react';

interface AgentZoneProps {
  agentId: string;
  onClick?: () => void;
}

const iconComponents = {
  Sprout,
  Zap,
  Flame,
  Waves,
};

export function AgentZone({ agentId, onClick }: AgentZoneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { selectedAgent, reducedMotion } = useAppStore();

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return null;

  const isSelected = selectedAgent === agentId;
  const IconComponent = iconComponents[agent.icon as keyof typeof iconComponents];

  // Generate particles for the zone
  const particleGeometry = useMemo(() => {
    const count = 50;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const color = new THREE.Color(agent.color);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.8 + Math.random() * 0.4;
      const height = (Math.random() - 0.5) * 1.5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [agent.color]);

  // Connection line geometry
  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0,
      -agent.position[0], -agent.position[1], -agent.position[2],
    ]);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [agent.position]);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;

    // Floating animation based on agent type
    const time = state.clock.elapsedTime;
    
    switch (agent.id) {
      case 'creator':
        // Gentle wave motion
        groupRef.current.position.y = Math.sin(time * 0.8) * 0.15;
        break;
      case 'coordinator':
        // Steady rotation
        groupRef.current.rotation.y = time * 0.1;
        break;
      case 'red-team':
        // Aggressive pulse
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        groupRef.current.scale.setScalar(1 + pulse * 0.05);
        break;
      case 'co-creator':
        // Wave interference
        groupRef.current.position.y = Math.sin(time * 1.2) * 0.08 + Math.sin(time * 0.6) * 0.05;
        break;
    }

    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.2;
    }
  });

  return (
    <group
      ref={groupRef}
      position={agent.position}
      onClick={onClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Zone base platform */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 32]} />
        <meshBasicMaterial
          color={agent.color}
          transparent
          opacity={0.2}
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

      {/* Particles */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Selection glow */}
      {isSelected && (
        <mesh>
          <sphereGeometry args={[1.5, 32, 32]} />
          <meshBasicMaterial
            color={agent.color}
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>
      )}

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
          className="glass-panel px-4 py-2 text-center"
          style={{
            borderColor: agent.color,
            boxShadow: `0 0 20px ${agent.glowColor}`,
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {IconComponent && <IconComponent size={16} color={agent.color} />}
            <span
              className="text-sm font-semibold"
              style={{ color: agent.color }}
            >
              {agent.role}
            </span>
          </div>
          <div className="text-white text-base font-medium">{agent.name}</div>
          <div className="text-white/60 text-xs mt-1">{agent.description}</div>
          <div
            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs"
            style={{
              backgroundColor: `${agent.color}30`,
              color: agent.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: agent.color }}
            />
            {agent.status}
          </div>
        </div>
      </Html>

      {/* Connection line to center */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={agent.color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
