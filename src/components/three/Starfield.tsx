import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '@/store/appStore';

interface StarfieldProps {
  count?: number;
}

export function Starfield({ count = 2000 }: StarfieldProps) {
  const meshRef = useRef<THREE.Points>(null);
  const { reducedMotion } = useAppStore();

  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorPalette = [
      new THREE.Color('#6C56FF'),
      new THREE.Color('#8A75FF'),
      new THREE.Color('#FFFFFF'),
      new THREE.Color('#B0BEC5'),
      new THREE.Color('#4CAF50'),
      new THREE.Color('#2196F3'),
    ];

    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const radius = 20 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * 2 + 0.5;
    }

    return [positions, colors, sizes];
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;
    
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [positions, colors, sizes]);

  return (
    <points ref={meshRef} geometry={geometry}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
