import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUIStore } from '../../state/useUIStore';

export const HoloScanPlane: React.FC = () => {
  const visualizationMode = useUIStore((state) => state.visualizationMode);
  const holoTransitionState = useUIStore((state) => state.holoTransitionState);
  const planeRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!planeRef.current) return;
    const elapsedTime = clock.getElapsedTime();
    // Move scan plane up and down smoothly
    planeRef.current.position.y = Math.sin(elapsedTime * 2.5) * 4.0;
  });

  const isActive = visualizationMode === 'holo' && (holoTransitionState === 'SCANNING' || holoTransitionState === 'BUILDING');

  if (!isActive) return null;

  return (
    <mesh ref={planeRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[16, 16]} />
      <meshBasicMaterial
        color="#C4B5FD"
        transparent={true}
        opacity={0.35}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

export default HoloScanPlane;
