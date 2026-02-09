import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, agents } from '@/store/appStore';
import { Sprout, Zap, Flame, Waves } from 'lucide-react';
import { getCircleTexture } from './particleTexture';

const iconComponents = { Sprout, Zap, Flame, Waves };
const circleAgents = ['creator', 'red-team', 'co-creator'];

function useAutoCamera(ringRadius: number) {
  const { camera, size } = useThree();
  const { bannerOpen } = useAppStore();
  useEffect(() => {
    if (bannerOpen) return;
    const aspect = size.width / size.height;
    const fov = 60; const padding = 1.2;
    const z = (ringRadius + padding) / (Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspect);
    const zC = THREE.MathUtils.clamp(z, 7, 15);
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.position.set(0, 2, zC); camera.lookAt(0, 0, 0);
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, size.width, size.height, ringRadius, bannerOpen]);
}

interface AgentCarouselProps { onAgentClick?: (agentId: string) => void; }

export function AgentCarousel({ onAgentClick }: AgentCarouselProps) {
  const carouselRef = useRef<THREE.Group>(null);
  const coordinatorRef = useRef<THREE.Group>(null);
  const agentGroupRefs = useRef<(THREE.Group | null)[]>([]);
  const particleRefs = useRef<(THREE.Points | null)[]>([]);
  const coordinatorParticlesRef = useRef<THREE.Points | null>(null);
  const { bannerOpen, isCarouselAnimating, setCarouselAnimating, reducedMotion, carouselRotation } = useAppStore();
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);
  const circleRadius = 4;
  useAutoCamera(circleRadius);

  const circlePositions = useMemo(() => circleAgents.map((agentId, index) => {
    const angle = (index / circleAgents.length) * Math.PI * 2 - Math.PI / 2;
    return { agentId, angle, x: Math.cos(angle) * circleRadius, z: Math.sin(angle) * circleRadius };
  }), [circleRadius]);

  const coordinatorAgent = agents.find(a => a.id === 'coordinator');

  const particleGeometries = useMemo(() => {
    return ['coordinator', ...circleAgents].map((agentId) => {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return null;
      const count = 75;
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const color = new THREE.Color(agent.color);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const r = 0.8 + Math.random() * 0.4;
        const h = (Math.random() - 0.5) * 1.5;
        positions[i*3] = Math.cos(a)*r; positions[i*3+1] = h; positions[i*3+2] = Math.sin(a)*r;
        colors[i*3] = color.r; colors[i*3+1] = color.g; colors[i*3+2] = color.b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      return geo;
    });
  }, []);

  const connectionGeometries = useMemo(() => circlePositions.map(({ x, z }) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0,0,0,-x,0,-z]), 3));
    return geo;
  }), [circlePositions]);

  useFrame((state) => {
    if (!carouselRef.current) return;
    const time = state.clock.elapsedTime;
    carouselRef.current.rotation.y = carouselRotation;
    if (coordinatorParticlesRef.current && !reducedMotion) coordinatorParticlesRef.current.rotation.y = time * 0.2;
    if (coordinatorRef.current && !reducedMotion && !bannerOpen) coordinatorRef.current.rotation.y = time * 0.1;
    if (!reducedMotion) {
      circleAgents.forEach((agentId, idx) => {
        const g = agentGroupRefs.current[idx];
        const p = particleRefs.current[idx];
        if (g) {
          const pulse = Math.sin(time * 3) * 0.5 + 0.5;
          g.scale.setScalar(1 + pulse * 0.05);
          switch (agentId) {
            case 'creator': g.position.y = Math.sin(time * 0.8) * 0.15; break;
            case 'red-team': break;
            case 'co-creator': g.position.y = Math.sin(time * 1.2) * 0.08; break;
          }
        }
        if (p) p.rotation.y = time * 0.2;
      });
    }
  });

  const handleAgentClick = (agentId: string, index: number) => {
    if (isCarouselAnimating) return;
    setCarouselAnimating(true);
    setSelectedAgentIndex(index);
    setTimeout(() => { onAgentClick?.(agentId); setCarouselAnimating(false); }, 500);
  };

  return (
    <group>
      {!bannerOpen && coordinatorAgent && (
        <group ref={coordinatorRef} position={[0,0,0]}>
          {particleGeometries[0] && (
            <points ref={coordinatorParticlesRef} geometry={particleGeometries[0]}>
              <pointsMaterial size={0.04} map={getCircleTexture()} vertexColors transparent opacity={0.9} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
            </points>
          )}
          <mesh onClick={() => onAgentClick?.('coordinator')} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
            <sphereGeometry args={[1.8,16,16]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
          <Html position={[0,2.5,0]} center distanceFactor={4} occlude={false} style={{ userSelect:'none' }}>
            <div className="glass-panel px-4 py-2 text-center cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => onAgentClick?.('coordinator')}
              style={{ borderColor: coordinatorAgent.color, boxShadow: `0 0 30px ${coordinatorAgent.glowColor}` }}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap size={18} color={coordinatorAgent.color} />
                <span className="text-lg font-bold" style={{ color: coordinatorAgent.color }}>{coordinatorAgent.role}</span>
              </div>
              <div className="text-white text-base font-medium">{coordinatorAgent.name}</div>
              <div className="text-white/60 text-xs mt-1">{coordinatorAgent.description}</div>
              <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs"
                style={{ backgroundColor: `${coordinatorAgent.color}30`, color: coordinatorAgent.color }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: coordinatorAgent.color }} />
                {coordinatorAgent.status}
              </div>
            </div>
          </Html>
        </group>
      )}
      <group ref={carouselRef}>
        {circlePositions.map(({ agentId, x, z }, index) => {
          const agent = agents.find(a => a.id === agentId);
          if (!agent) return null;
          const Icon = iconComponents[agent.icon as keyof typeof iconComponents];
          const isSelected = selectedAgentIndex === index;
          const pGeo = particleGeometries[index + 1];
          return (
            <group key={agentId} position={[x,0,z]}>
              <group ref={(el: any) => { agentGroupRefs.current[index] = el; }}>
                <mesh><sphereGeometry args={[0.7,32,32]} /><meshBasicMaterial color={agent.color} transparent opacity={0.6} blending={THREE.AdditiveBlending} /></mesh>
                <mesh><sphereGeometry args={[1.0,32,32]} /><meshBasicMaterial color={agent.color} transparent opacity={0.15} side={THREE.BackSide} blending={THREE.AdditiveBlending} /></mesh>
                <mesh position={[0,-0.5,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[0.9,1.0,32]} /><meshBasicMaterial color={agent.color} transparent opacity={0.3} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} /></mesh>
                <mesh rotation={[Math.PI/3,Math.PI/4,0]}><torusGeometry args={[1.1,0.015,16,64]} /><meshBasicMaterial color={agent.color} transparent opacity={0.4} blending={THREE.AdditiveBlending} /></mesh>
                {pGeo && (<points ref={(el: any) => { particleRefs.current[index] = el; }} geometry={pGeo}>
                  <pointsMaterial size={0.04} map={getCircleTexture()} vertexColors transparent opacity={0.9} depthWrite={false} sizeAttenuation blending={THREE.AdditiveBlending} />
                </points>)}
                {isSelected && (<mesh><sphereGeometry args={[1.5,32,32]} /><meshBasicMaterial color={agent.color} transparent opacity={0.2} blending={THREE.AdditiveBlending} side={THREE.BackSide} /></mesh>)}
                <mesh onClick={() => handleAgentClick(agentId, index)} onPointerOver={() => document.body.style.cursor='pointer'} onPointerOut={() => document.body.style.cursor='auto'}>
                  <sphereGeometry args={[1.3,16,16]} /><meshBasicMaterial transparent opacity={0} />
                </mesh>
                <Html position={[0,1.8,0]} center distanceFactor={4} occlude={false} style={{ pointerEvents:'none', userSelect:'none' }}>
                  <div className="glass-panel px-3 py-2 text-center" style={{ borderColor: agent.color, boxShadow: isSelected ? `0 0 30px ${agent.glowColor}` : `0 0 15px ${agent.glowColor}` }}>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      {Icon && <Icon size={14} color={agent.color} />} <span className="text-sm font-semibold" style={{ color: agent.color }}>{agent.role}</span>
                    </div>
                    <div className="text-white text-sm font-medium">{agent.name}</div>
                  </div>
                </Html>
                <lineSegments geometry={connectionGeometries[index]}><lineBasicMaterial color={agent.color} transparent opacity={0.2} blending={THREE.AdditiveBlending} /></lineSegments>
              </group>
            </group>
          );
        })}
      </group>
    </group>
  );
}
