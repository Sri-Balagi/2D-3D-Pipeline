import React, { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useWorldStore } from '../../state/useWorldStore';

interface AnimatedDotMeshProps {
  meshUrls?: string[];
}

export const AnimatedDotMesh: React.FC<AnimatedDotMeshProps> = () => {
  const meshUrls = useWorldStore(state => state.animatedMeshes);
  const setAnimationStartTime = useWorldStore(state => state.setAnimationStartTime);
  
  const [currentStage, setCurrentStage] = useState(0);
  const [geometries, setGeometries] = useState<THREE.BufferGeometry[]>([]);

  // Pre-load and parse all OBJs
  useEffect(() => {
    let active = true;
    const fetchGeoms = async () => {
      try {
        const loadedGeoms = [];
        for (const url of meshUrls) {
          const res = await fetch(url);
          const text = await res.text();
          const lines = text.split('\n');
          const positions: number[] = [];
          for (const line of lines) {
            if (line.startsWith('v ')) {
              const parts = line.trim().split(/\s+/);
              if (parts.length >= 4) {
                positions.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));
              }
            }
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          
          // Compute bounding box to center it
          geo.computeBoundingBox();
          if (geo.boundingBox) {
            const center = new THREE.Vector3();
            geo.boundingBox.getCenter(center);
            geo.translate(-center.x, -center.y, -center.z);
            
            // Normalize scale so it fits nicely
            geo.computeBoundingBox();
            const size = new THREE.Vector3();
            geo.boundingBox.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            if (maxDim > 0) {
              const scale = 10 / maxDim; // Fit within 10 units
              geo.scale(scale, scale, scale);
            }
          }
          
          loadedGeoms.push(geo);
        }
        if (active) {
          setGeometries(loadedGeoms);
          setAnimationStartTime(Date.now());
        }
      } catch (e) {
        console.error('Failed to load dot meshes', e);
      }
    };
    fetchGeoms();

    return () => {
      active = false;
      // Cleanup geometries
      geometries.forEach(geo => geo.dispose());
    };
  }, [meshUrls]);

  // Animation sequence: 10s per stage
  useEffect(() => {
    if (geometries.length === 0 || currentStage >= meshUrls.length - 1) return;

    const timer = setTimeout(() => {
      setCurrentStage(prev => prev + 1);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [currentStage, geometries.length, meshUrls.length]);

  const activeGeometry = geometries[currentStage];

  if (!activeGeometry) return null;

  return (
    <group>
      <points key={currentStage} geometry={activeGeometry}>
        <pointsMaterial 
          size={0.08} 
          color="#00ffff" 
          transparent 
          opacity={0.8} 
          sizeAttenuation={true} 
        />
      </points>
    </group>
  );
};
