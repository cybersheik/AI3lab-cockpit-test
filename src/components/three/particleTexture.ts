import * as THREE from 'three';

// Creates a soft circular gradient texture for particles
// Without this, THREE.Points renders ugly squares
let _circleTexture: THREE.Texture | null = null;

export function getCircleTexture(): THREE.Texture {
  if (_circleTexture) return _circleTexture;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Radial gradient: white center → transparent edge
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  _circleTexture = new THREE.CanvasTexture(canvas);
  _circleTexture.needsUpdate = true;
  return _circleTexture;
}
