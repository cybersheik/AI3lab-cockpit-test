import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/appStore';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

interface KnowledgeParticlesProps {
  count?: number;
}

export function KnowledgeParticles({ count: propCount }: KnowledgeParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const { reducedMotion } = useAppStore();
  const { maxParticles } = useDeviceCapabilities();

  const count = propCount || Math.min(maxParticles, 200);

  const { positions, colors, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    const colorPalette = [
      new THREE.Color('#6C56FF'),
      new THREE.Color('#4CAF50'),
      new THREE.Color('#2196F3'),
      new THREE.Color('#9C27B0'),
      new THREE.Color('#FFFFFF'),
    ];

    for (let i = 0; i < count; i++) {
      // Random position in a sphere around the scene
      const radius = 8 + Math.random() * 12;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random velocity for floating motion
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.01
        )
      );
    }

    return { positions, colors, velocities };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((state) => {
    if (!particlesRef.current || !groupRef.current || reducedMotion) return;

    const positionArray = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Gentle floating motion
      positionArray[i3] += velocities[i].x + Math.sin(time * 0.5 + i) * 0.002;
      positionArray[i3 + 1] += velocities[i].y + Math.cos(time * 0.3 + i) * 0.002;
      positionArray[i3 + 2] += velocities[i].z + Math.sin(time * 0.4 + i) * 0.002;

      // Boundary check - wrap around
      const dist = Math.sqrt(
        positionArray[i3] ** 2 +
        positionArray[i3 + 1] ** 2 +
        positionArray[i3 + 2] ** 2
      );

      if (dist > 25) {
        positionArray[i3] *= 0.8;
        positionArray[i3 + 1] *= 0.8;
        positionArray[i3 + 2] *= 0.8;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Slow rotation of the entire group
    groupRef.current.rotation.y = time * 0.01;
  });

  return (
    <group ref={groupRef}>
      <points ref={particlesRef} geometry={geometry}>
        <pointsMaterial
          size={0.08}
          vertexColors
          transparent
          opacity={0.6}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
