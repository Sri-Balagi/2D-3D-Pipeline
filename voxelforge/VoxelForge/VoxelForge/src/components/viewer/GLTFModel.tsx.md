# GLTFModel.tsx

``tsx
import React, { useState, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Html } from '@react-three/drei';
import { AssetLoaderService } from '../../services/modelLoader';
import type { VisualizationMode } from '../../state/useUIStore';
import type { ActiveModelInfo } from '../../types/world';

interface GLTFModelProps {
  url: string;
  filename: string;
  source: 'MOCK' | 'PRESET_GLB' | 'USER_GLB';
  fileSize?: number;
  clippingPlanes: THREE.Plane[];
  visualizationMode: VisualizationMode;
  onLoadSuccess?: (gltfScene: THREE.Group, metadata: ActiveModelInfo) => void;
  onLoadFailure?: () => void;
}

export const GLTFModel: React.FC<GLTFModelProps> = ({
  url,
  filename,
  source,
  fileSize,
  clippingPlanes,
  visualizationMode,
  onLoadSuccess,
  onLoadFailure,
}) => {
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);

  // 1. Asynchronously load the GLB/GLTF file
  useEffect(() => {
    setLoading(true);
    setError(false);
    setProgress(0);

    const loader = new GLTFLoader();
    
    loader.load(
      url,
      (gltf) => {
        // Cache original material states in mesh userData to preserve colors/textures on restore
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.material) {
              const originalMat = Array.isArray(mesh.material)
                ? mesh.material.map((m) => m.clone())
                : mesh.material.clone();
              mesh.userData.originalMaterial = originalMat;
            }
          }
        });
        
        setModel(gltf.scene);
        setLoading(false);

        // Extract metadata using AssetLoaderService
        const metadata = AssetLoaderService.parseModelMetadata(gltf.scene, filename, source, fileSize);
        
        if (onLoadSuccess) {
          onLoadSuccess(gltf.scene, metadata);
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          setProgress(Math.round((xhr.loaded / xhr.total) * 100));
        }
      },
      (err) => {
        console.warn(`Failed to load GLTF asset from ${url}:`, err);
        setError(true);
        setLoading(false);
        if (onLoadFailure) onLoadFailure();
      }
    );

    return () => {
      setModel(null);
    };
  }, [url]);

  // 2. Dynamically apply clipping planes & visualization modes on state change
  useEffect(() => {
    if (!model) return;

    model.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const originalMat = mesh.userData.originalMaterial;
        
        if (originalMat) {
          if (visualizationMode === 'solid') {
            // Restore original material directly. Avoids cloning in a loop and recompiles!
            const applyPlanes = (m: THREE.Material) => {
              m.clippingPlanes = clippingPlanes;
              m.needsUpdate = true;
            };
            if (Array.isArray(originalMat)) {
              originalMat.forEach(applyPlanes);
              mesh.material = originalMat;
            } else {
              applyPlanes(originalMat);
              mesh.material = originalMat;
            }
          } else {
            // Clone the original material once for custom visual overrides
            const mat = Array.isArray(originalMat)
              ? originalMat.map((m) => m.clone())
              : originalMat.clone();

            const applyRendererModes = (m: THREE.Material) => {
              m.clippingPlanes = clippingPlanes;
              m.needsUpdate = true;

              switch (visualizationMode) {
                case 'wireframe':
                  (m as any).wireframe = true;
                  break;
                case 'ghost':
                  m.transparent = true;
                  m.opacity = 0.25;
                  break;
                case 'x-ray':
                  m.transparent = true;
                  m.opacity = 0.2;
                  m.depthWrite = false;
                  m.depthTest = true;
                  if ('emissive' in m) {
                    (m as any).emissive = new THREE.Color('#0284c7'); // sky-600
                    (m as any).emissiveIntensity = 0.8;
                  }
                  break;
                case 'holo':
                  (m as any).color = new THREE.Color('#0891b2'); // cyan-600
                  m.transparent = true;
                  m.opacity = 0.3;
                  if ('emissive' in m) {
                    (m as any).emissive = new THREE.Color('#22d3ee'); // cyan-400
                    (m as any).emissiveIntensity = 1.5; // Glowing hologram effect!
                  }
                  break;
                case 'semantic':
                  // Neutral asset-level semantic color mapping (indigo)
                  (m as any).color = new THREE.Color('#6366f1');
                  if ('emissive' in m) {
                    (m as any).emissive = new THREE.Color('#4f46e5');
                    (m as any).emissiveIntensity = 0.5;
                  }
                  if ('map' in m) (m as any).map = null;
                  break;
                case 'confidence':
                  // Neutral asset-level confidence mapping (Green)
                  (m as any).color = new THREE.Color('#10b981');
                  if ('emissive' in m) {
                    (m as any).emissive = new THREE.Color('#059669');
                    (m as any).emissiveIntensity = 0.5;
                  }
                  if ('map' in m) (m as any).map = null;
                  break;
                default:
                  break;
              }
            };

            if (Array.isArray(mat)) {
              mat.forEach(applyRendererModes);
            } else {
              applyRendererModes(mat);
            }
            mesh.material = mat;
          }
        }
      }
    });
  }, [model, clippingPlanes, visualizationMode]);

  // Loading indicator overlay
  if (loading) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color="var(--accent-cyan)" wireframe />
        </mesh>
        <Html distanceFactor={8} center>
          <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '9px', whiteSpace: 'nowrap' }}>
            LOADING MODEL {progress > 0 ? `(${progress}%)` : ''}
          </div>
        </Html>
      </group>
    );
  }

  // Error unavailable overlay billboard
  if (error) {
    return (
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ef4444" wireframe />
        </mesh>
        <Html distanceFactor={8} center>
          <div style={{
            background: 'rgba(20, 24, 34, 0.95)',
            border: '1px solid var(--accent-red)',
            color: '#fff',
            padding: '8px 12px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            textAlign: 'center',
            width: '240px'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '4px' }}>�s� ASSET UNAVAILABLE</div>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Real 3D model preset not found in local models path.
            </div>
            <div style={{ fontSize: '9px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Path: {url}
            </div>
          </div>
        </Html>
      </group>
    );
  }

  return <primitive object={model!} />;
};
export default GLTFModel;

``