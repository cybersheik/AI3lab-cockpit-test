import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, iterations } from '@/store/appStore';

interface TimelineProps {
  radius?: number;
}

export function Timeline({ radius = 5 }: TimelineProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { currentIteration, reducedMotion, setIteration } = useAppStore();

  // Calculate positions for each iteration node
  const nodePositions = useMemo(() => {
    return iterations.map((iter, index) => {
      const angle = (index / iterations.length) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.cos(angle) * radius,
        y: 3,
        z: Math.sin(angle) * radius,
        angle,
        iteration: iter,
      };
    });
  }, [radius]);

  // Connection line geometry
  const lineGeometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < nodePositions.length; i++) {
      const current = nodePositions[i];
      const next = nodePositions[(i + 1) % nodePositions.length];
      positions.push(
        current.x, current.y, current.z,
        next.x, next.y, next.z
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    return geo;
  }, [nodePositions]);

  // Progress line geometry
  const progressLineGeometry = useMemo(() => {
    if (currentIteration <= 1) return null;
    const positions: number[] = [];
    for (let i = 0; i < currentIteration - 1 && i < nodePositions.length - 1; i++) {
      const current = nodePositions[i];
      const next = nodePositions[i + 1];
      positions.push(current.x, current.y, current.z, next.x, next.y, next.z);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    return geo;
  }, [nodePositions, currentIteration]);

  useFrame((state) => {
    if (!groupRef.current || reducedMotion) return;
    
    // Slow rotation of the entire timeline
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  const getNodeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'active':
        return '#6C56FF';
      case 'planned':
        return '#78909C';
      default:
        return '#78909C';
    }
  };

  const getNodeSize = (status: string) => {
    if (status === 'active') return 0.25;
    return 0.15;
  };

  return (
    <group ref={groupRef}>
      {/* Connection lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color="#4A5568"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Progress line (completed iterations) */}
      {progressLineGeometry && (
        <lineSegments geometry={progressLineGeometry}>
          <lineBasicMaterial
            color="#4CAF50"
            transparent
            opacity={0.6}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}

      {/* Iteration nodes */}
      {nodePositions.map(({ x, y, z, iteration }) => {
        const color = getNodeColor(iteration.status);
        const size = getNodeSize(iteration.status);
        const isActive = iteration.status === 'active';
        const isCompleted = iteration.status === 'completed';

        return (
          <group key={iteration.id} position={[x, y, z]}>
            {/* Node sphere */}
            <mesh
              onClick={() => setIteration(iteration.id)}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            >
              <sphereGeometry args={[size, 16, 16]} />
              <meshBasicMaterial
                color={color}
                transparent
                opacity={isActive ? 1 : 0.8}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Glow for active/completed */}
            {(isActive || isCompleted) && (
              <mesh scale={isActive ? 2 : 1.5}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.2}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                />
              </mesh>
            )}

            {/* Pulse animation for active */}
            {isActive && !reducedMotion && (
              <mesh scale={3}>
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.1}
                  blending={THREE.AdditiveBlending}
                  side={THREE.BackSide}
                />
              </mesh>
            )}

            {/* HTML tooltip */}
            <Html
              position={[0, size + 0.3, 0]}
              center
              distanceFactor={10}
              style={{
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <div className="glass-panel px-3 py-1.5 text-center min-w-[100px]">
                <div
                  className="text-xs font-semibold"
                  style={{ color }}
                >
                  {iteration.name}
                </div>
                <div className="text-white/60 text-[10px] mt-0.5">
                  {iteration.description}
                </div>
                {isActive && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-indigo-400 text-[10px]">Active</span>
                  </div>
                )}
              </div>
            </Html>

            {/* Human checkpoint indicator */}
            {[2, 5, 8, 12].includes(iteration.id) && (
              <mesh position={[0, -size - 0.2, 0]}>
                <octahedronGeometry args={[0.08, 0]} />
                <meshBasicMaterial
                  color="#FFD700"
                  transparent
                  opacity={0.9}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Center label */}
      <Html
        position={[0, 4.5, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="glass-panel px-4 py-2 text-center">
          <div className="text-white/60 text-xs uppercase tracking-wider mb-1">
            Iteration Timeline
          </div>
          <div className="text-white text-lg font-semibold">
            {currentIteration} / 15
          </div>
          <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${(currentIteration / 15) * 100}%` }}
            />
          </div>
        </div>
      </Html>
    </group>
  );
}
