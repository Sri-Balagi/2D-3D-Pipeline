# Viewport.tsx

``tsx
import React, { useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import type { VisualizationMode } from '../../state/useUIStore';
import { useSimulationStore } from '../../state/useSimulationStore';
import { getGeometryProps } from '../../utils/geometryFactory';
import { GLTFModel } from './GLTFModel';
import type { Entity } from '../../types/world';

interface CameraControllerProps {
  loadedGroup: THREE.Group | null;
}

// Component to handle camera changes based on state and loaded model bounding boxes
const CameraController: React.FC<CameraControllerProps> = ({ loadedGroup }) => {
  const { camera, controls } = useThree();
  const cameraMode = useUIStore((state) => state.cameraMode);

  // Auto-fit camera when a new group is loaded!
  React.useEffect(() => {
    if (!loadedGroup) {
      // Restore standard camera position for mock worlds
      camera.position.set(8, 8, 8);
      camera.lookAt(0, 0, 0);
      const orbitControls = controls as any;
      if (orbitControls) {
        orbitControls.target.set(0, 0, 0);
        orbitControls.update();
      }
      return;
    }

    const box = new THREE.Box3().setFromObject(loadedGroup);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z);
    
    // Fit the camera distance to the bounding box
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fovRad = (perspectiveCam.fov ? (perspectiveCam.fov * Math.PI) / 180 : 0.7);
    let cameraDistance = maxDim / (2 * Math.tan(fovRad / 2));
    cameraDistance *= 1.5; // add padding factor

    // Adjust for aspect ratio
    const aspect = (camera as any).aspect ?? 1;
    if (aspect < 1) {
      cameraDistance = cameraDistance / aspect;
    }

    // Set camera coordinates relative to the model's actual center
    camera.position.set(
      center.x + cameraDistance * 0.7,
      center.y + cameraDistance * 0.7,
      center.z + cameraDistance * 0.7
    );
    camera.lookAt(center);
    
    // Update OrbitControls target center coordinates
    const orbitControls = controls as any;
    if (orbitControls) {
      orbitControls.target.copy(center);
      orbitControls.update();
    }
  }, [loadedGroup, camera, controls]);

  // Handle standard preset camera modes relative to model center
  React.useEffect(() => {
    const targetCenter = new THREE.Vector3(0, 0, 0);
    if (loadedGroup) {
      const box = new THREE.Box3().setFromObject(loadedGroup);
      box.getCenter(targetCenter);
    }
    
    const orbitControls = controls as any;
    const distance = camera.position.distanceTo(targetCenter);

    if (cameraMode === 'top') {
      camera.position.set(targetCenter.x, targetCenter.y + distance, targetCenter.z);
      camera.lookAt(targetCenter);
    } else if (cameraMode === 'front') {
      camera.position.set(targetCenter.x, targetCenter.y, targetCenter.z + distance);
      camera.lookAt(targetCenter);
    } else if (cameraMode === 'side') {
      camera.position.set(targetCenter.x + distance, targetCenter.y, targetCenter.z);
      camera.lookAt(targetCenter);
    } else if (cameraMode === 'isometric') {
      camera.position.set(targetCenter.x + distance * 0.6, targetCenter.y + distance * 0.6, targetCenter.z + distance * 0.6);
      camera.lookAt(targetCenter);
    } else if (cameraMode === 'orbit' && !loadedGroup) {
      camera.position.set(8, 8, 8);
      camera.lookAt(targetCenter);
    }

    if (orbitControls) {
      orbitControls.target.copy(targetCenter);
      orbitControls.update();
    }
  }, [cameraMode, loadedGroup, camera, controls]);

  return null;
};

// Individual Entity Mesh Renderer
interface EntityMeshProps {
  entity: Entity;
  visualizationMode: VisualizationMode;
  explosionFactor: number;
  simState: any;
  clippingPlanes: THREE.Plane[];
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onClickPoint: (point: [number, number, number]) => void;
  measurementMode: boolean;

  // Real GLB loader integrations
  worldSource: 'MOCK' | 'PRESET_GLB' | 'USER_GLB';
  activeModelInfo: any;
  onLoadSuccess: (scene: THREE.Group, meta: any) => void;
}

const EntityMesh: React.FC<EntityMeshProps> = ({
  entity,
  visualizationMode,
  explosionFactor,
  simState,
  clippingPlanes,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  onClickPoint,
  measurementMode,
  worldSource,
  activeModelInfo,
  onLoadSuccess,
}) => {
  const geomProps = useMemo(() => getGeometryProps(entity.geometry), [entity.geometry]);
  const meshRef = useRef<THREE.Mesh>(null);
  const [useFallback, setUseFallback] = React.useState(false);

  // Position displacement calculation (Exploded view radial offset)
  const basePos = simState?.position || entity.transform.position;
  const position = useMemo(() => {
    if (explosionFactor === 0) return basePos;
    // Displace away from [0, 0, 0] radially
    return [
      basePos[0] * (1 + explosionFactor * 0.4),
      basePos[1] * (1 + explosionFactor * 0.4),
      basePos[2] * (1 + explosionFactor * 0.4),
    ] as [number, number, number];
  }, [basePos, explosionFactor]);

  const rotation = simState?.rotation || entity.transform.rotation;
  const scale = simState?.scale || entity.transform.scale;

  // Custom colors depending on Mode
  const semanticClasses = useWorldStore((state) => state.currentWorldState?.semanticClasses);
  const semanticColor = semanticClasses?.[entity.semanticClass]?.color ?? '#94a3b8';

  const materialColor = useMemo(() => {
    if (simState?.color) return simState.color;
    if (entity.visualOverrides?.color) return entity.visualOverrides.color;
    
    if (visualizationMode === 'semantic') {
      return semanticColor;
    }
    if (visualizationMode === 'confidence') {
      // Color gradient based on confidence
      if (entity.confidence >= 0.9) return '#10b981'; // Green
      if (entity.confidence >= 0.7) return '#f59e0b'; // Yellow
      return '#ef4444'; // Red
    }
    if (visualizationMode === 'holo') {
      return '#06b6d4'; // Cyan
    }
    return '#4b5563'; // standard grey
  }, [entity, visualizationMode, semanticColor, simState]);

  // Click handler
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (measurementMode) {
      onClickPoint([e.point.x, e.point.y, e.point.z]);
    } else {
      onSelect(entity.id);
    }
  };

  const isVisible = entity.visualOverrides?.visible !== false;
  if (!isVisible) return null;

  // Set up materials
  const opacity = visualizationMode === 'x-ray' || visualizationMode === 'ghost' 
    ? 0.25 
    : (visualizationMode === 'holo' ? 0.15 : (entity.visualOverrides?.opacity ?? 1.0));

  const transparent = opacity < 1.0;

  const standardMaterial = (
    <meshStandardMaterial
      color={materialColor}
      transparent={transparent}
      opacity={opacity}
      roughness={0.4}
      metalness={0.2}
      clippingPlanes={clippingPlanes}
      depthWrite={visualizationMode !== 'x-ray'}
      emissive={visualizationMode === 'holo' ? materialColor : '#000000'}
      emissiveIntensity={visualizationMode === 'holo' ? 0.3 : 0.0}
    />
  );

  const wireframeMaterial = (
    <meshBasicMaterial
      color={visualizationMode === 'holo' ? '#06b6d4' : '#64748b'}
      wireframe={true}
      clippingPlanes={clippingPlanes}
      transparent={true}
      opacity={0.8}
    />
  );

  // Render R3F geometries
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Selection outline mesh */}
      {(isSelected || isHovered) && geomProps.type !== 'path' && (
        <mesh>
          {geomProps.type === 'box' && <boxGeometry args={geomProps.args as any} />}
          {geomProps.type === 'cylinder' && <cylinderGeometry args={geomProps.args as any} />}
          {geomProps.type === 'sphere' && <sphereGeometry args={geomProps.args as any} />}
          <meshBasicMaterial
            color={isSelected ? '#06b6d4' : '#e2e8f0'}
            wireframe={true}
            transparent={true}
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Render GLTF Model or fallback to procedural geometry */}
      {entity.geometry.glbPath && !useFallback ? (
        <group
          onPointerDown={handlePointerDown}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(entity.id);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onHover(null);
          }}
        >
          <GLTFModel
            url={entity.geometry.glbPath}
            filename={activeModelInfo?.filename ?? 'model.glb'}
            source={worldSource}
            fileSize={activeModelInfo?.fileSize}
            clippingPlanes={clippingPlanes}
            visualizationMode={visualizationMode}
            onLoadSuccess={onLoadSuccess}
            onLoadFailure={() => {
              if (worldSource === 'MOCK') setUseFallback(true);
            }}
          />
        </group>
      ) : (
        geomProps.type !== 'path' && (
          <mesh
            ref={meshRef}
            onPointerDown={handlePointerDown}
            onPointerOver={(e) => {
              e.stopPropagation();
              onHover(entity.id);
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              onHover(null);
            }}
          >
            {geomProps.type === 'box' && <boxGeometry args={geomProps.args as any} />}
            {geomProps.type === 'cylinder' && <cylinderGeometry args={geomProps.args as any} />}
            {geomProps.type === 'sphere' && <sphereGeometry args={geomProps.args as any} />}
            
            {visualizationMode === 'wireframe' ? wireframeMaterial : standardMaterial}
          </mesh>
        )
      )}

      {/* Render custom paths */}
      {geomProps.type === 'path' && geomProps.points && geomProps.points.length > 1 && (
        <Line
          points={geomProps.points}
          color={materialColor}
          lineWidth={3}
          onPointerDown={handlePointerDown}
        />
      )}
    </group>
  );
};

export const Viewport: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const hoveredEntityId = useWorldStore((state) => state.hoveredEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  const hoverEntity = useWorldStore((state) => state.hoverEntity);
  
  const worldSource = useWorldStore((state) => state.worldSource);
  const activeModelInfo = useWorldStore((state) => state.activeModelInfo);
  const setActiveModelInfo = useWorldStore((state) => state.setActiveModelInfo);

  const [loadedGroup, setLoadedGroup] = React.useState<THREE.Group | null>(null);

  // Reset loadedGroup when switching to procedural mock worlds
  React.useEffect(() => {
    if (worldSource === 'MOCK') {
      setLoadedGroup(null);
    }
  }, [worldSource]);

  const {
    visualizationMode,
    explosionFactor,
    clipX,
    clipY,
    clipZ,
    clipXActive,
    clipYActive,
    clipZActive,
    measurementMode,
    measurementPoints,
    addMeasurementPoint,
    setCameraMode
  } = useUIStore();

  const entitySimulationStates = useSimulationStore((state) => state.entitySimulationStates);

  // Compute clipping planes scaled by world scale
  const clippingPlanes = useMemo(() => {
    const planes: THREE.Plane[] = [];
    const scale = currentWorldState?.metadata.scale ?? 1.0;
    if (clipXActive) planes.push(new THREE.Plane(new THREE.Vector3(-1, 0, 0), clipX * scale));
    if (clipYActive) planes.push(new THREE.Plane(new THREE.Vector3(0, -1, 0), clipY * scale));
    if (clipZActive) planes.push(new THREE.Plane(new THREE.Vector3(0, 0, -1), clipZ * scale));
    return planes;
  }, [clipXActive, clipYActive, clipZActive, clipX, clipY, clipZ, currentWorldState]);

  // Compute measurement distance
  const measurementDistance = useMemo(() => {
    if (measurementPoints.length < 2 || !currentWorldState) return null;
    const [p1, p2] = measurementPoints;
    const distMeters = Math.sqrt(
      Math.pow(p1[0] - p2[0], 2) +
      Math.pow(p1[1] - p2[1], 2) +
      Math.pow(p1[2] - p2[2], 2)
    );
    const scale = currentWorldState.metadata.scale;
    const distUnits = distMeters / scale;
    return `${distUnits.toFixed(2)} ${currentWorldState.metadata.units}`;
  }, [measurementPoints, currentWorldState]);

  // Keyboard shortcut listener inside Viewport
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ensure target isn't input text box
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'r' || e.key === 'R') {
        setCameraMode('orbit');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraMode]);


  return (
    <div className="canvas-wrapper">
      <Canvas
        gl={{ localClippingEnabled: true, antialias: true }}
        camera={{ position: [8, 8, 8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0a0b0d']} />
        
        {/* Technical/Dynamic Studio Lighting Rig */}
        <ambientLight intensity={1.2} />
        <hemisphereLight color="#ffffff" groundColor="#0f172a" intensity={0.8} />
        <pointLight position={[15, 20, 15]} intensity={2.5} />
        <directionalLight position={[-15, 15, -10]} intensity={2.0} />
        <directionalLight position={[10, -10, 10]} intensity={0.5} />

        <CameraController loadedGroup={loadedGroup} />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.1} />

        {/* Technical Grid */}
        <gridHelper args={[30, 30, '#1e293b', '#0f172a']} position={[0, -0.05, 0]} />
        <axesHelper args={[4]} />

        {/* Draw World Entities */}
        {currentWorldState &&
          Object.values(currentWorldState.entities).map((entity) => (
            <EntityMesh
              key={entity.id}
              entity={entity}
              visualizationMode={visualizationMode}
              explosionFactor={explosionFactor}
              simState={entitySimulationStates[entity.id]}
              clippingPlanes={clippingPlanes}
              isSelected={selectedEntityId === entity.id}
              isHovered={hoveredEntityId === entity.id}
              onSelect={(id) => selectEntity(id)}
              onHover={(id) => hoverEntity(id)}
              onClickPoint={addMeasurementPoint}
              measurementMode={measurementMode}
              worldSource={worldSource}
              activeModelInfo={activeModelInfo}
              onLoadSuccess={(scene, meta) => {
                setLoadedGroup(scene);
                setActiveModelInfo(meta);
              }}
            />
          ))}

        {/* Draw 3D Floating Annotations */}
        {currentWorldState &&
          Object.values(currentWorldState.annotations).map((ann) => {
            const isWarning = ann.type === 'warning';
            return (
              <Html key={ann.id} position={ann.position} distanceFactor={8}>
                <div
                  style={{
                    padding: '3px 8px',
                    background: isWarning ? 'rgba(239, 68, 68, 0.95)' : 'rgba(20, 24, 34, 0.95)',
                    border: `1px solid ${isWarning ? 'var(--accent-red)' : 'var(--accent-cyan)'}`,
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                  onClick={() => ann.entityId && selectEntity(ann.entityId)}
                >
                  {isWarning ? '�s�' : '�"�'} {ann.text.substring(0, 16)}...
                </div>
              </Html>
            );
          })}

        {/* Draw Measurement Tools */}
        {measurementPoints.map((pt, i) => (
          <mesh key={i} position={pt}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="var(--accent-orange)" />
          </mesh>
        ))}

        {measurementPoints.length === 2 && (
          <>
            <Line
              points={measurementPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]))}
              color="var(--accent-orange)"
              lineWidth={2}
            />
            <Html
              position={[
                (measurementPoints[0][0] + measurementPoints[1][0]) / 2,
                (measurementPoints[0][1] + measurementPoints[1][1]) / 2,
                (measurementPoints[0][2] + measurementPoints[1][2]) / 2,
              ]}
              distanceFactor={8}
            >
              <div
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--accent-orange)',
                  color: 'var(--accent-orange)',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {measurementDistance}
              </div>
            </Html>
          </>
        )}
      </Canvas>

      {/* Visual Indicator HUD Overlay */}
      {measurementMode && (
        <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 4 }} className="hud-card flex-col">
          <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
            [MEASUREMENT MODE ACTIVE]
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Click 3D surfaces to register points.
          </span>
          {measurementPoints.length === 1 && <span>Point A Registered. Click second location.</span>}
          {measurementDistance && (
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Distance: {measurementDistance}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default Viewport;

``