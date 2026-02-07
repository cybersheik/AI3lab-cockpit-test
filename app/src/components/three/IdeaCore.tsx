import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, workModes } from '@/store/appStore';

// Custom shader material
const vertexShader = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  // Simplex noise function
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    
    float noise = snoise(position * 1.5 + uTime * 0.3);
    vDisplacement = noise * 0.15;
    
    vec3 newPosition = position + normal * vDisplacement;
    vPosition = newPosition;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uPulseIntensity;
  uniform vec3 uBaseColor;
  uniform vec3 uGlowColor;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
    
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    float intensity = uPulseIntensity + pulse * 0.3;
    
    vec3 color = mix(uBaseColor, uGlowColor, fresnel * 0.7 + vDisplacement * 2.0);
    color *= intensity;
    
    float alpha = 0.8 + fresnel * 0.2;
    
    gl_FragColor = vec4(color, alpha);
  }
`;

interface IdeaCoreProps {
  scale?: number;
}

export function IdeaCore({ scale = 1 }: IdeaCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const { currentMode, reducedMotion } = useAppStore();

  const mode = workModes.find(m => m.id === currentMode);
  
  const coreConfig = useMemo(() => {
    switch (mode?.layout.ideaCore) {
      case 'large':
        return { scale: 1.3, pulseSpeed: 2, intensity: 0.8 };
      case 'compact':
        return { scale: 0.9, pulseSpeed: 3, intensity: 0.6 };
      case 'crystallized':
        return { scale: 1.0, pulseSpeed: 1.5, intensity: 0.7 };
      case 'perfected':
        return { scale: 1.1, pulseSpeed: 1, intensity: 0.9 };
      default:
        return { scale: 1.0, pulseSpeed: 2, intensity: 0.7 };
    }
  }, [mode]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uPulseIntensity: { value: coreConfig.intensity },
    uBaseColor: { value: new THREE.Color('#6C56FF') },
    uGlowColor: { value: new THREE.Color('#8A75FF') },
  }), [coreConfig.intensity]);

  useFrame((state) => {
    if (!meshRef.current || reducedMotion) return;

    // Rotate the sphere
    meshRef.current.rotation.y += 0.002;
    
    // Update shader uniforms
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uPulseIntensity.value = 
      coreConfig.intensity + Math.sin(state.clock.elapsedTime * coreConfig.pulseSpeed) * 0.15;

    // Animate glow
    if (glowRef.current) {
      const glowScale = 1.2 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.setScalar(glowScale);
    }
  });

  return (
    <group scale={scale * coreConfig.scale}>
      {/* Main sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer glow */}
      <mesh ref={glowRef} scale={1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#6C56FF"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner core */}
      <mesh scale={0.5}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#8A75FF"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.02, 16, 100]} />
        <meshBasicMaterial
          color="#6C56FF"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Second orbital ring (rotated) */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 100]} />
        <meshBasicMaterial
          color="#8A75FF"
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
