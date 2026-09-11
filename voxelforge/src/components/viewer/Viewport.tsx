import React, { useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import type { VisualizationMode } from '../../state/useUIStore';
import { useSimulationStore } from '../../state/useSimulationStore';
import { getGeometryProps } from '../../utils/geometryFactory';
import { GLTFModel } from './GLTFModel';
import { AnimatedDotMesh } from './AnimatedDotMesh';
import type { Entity } from '../../types/world';

import HoloScanPlane from './HoloScanPlane';
import SemanticLabels from './SemanticLabels';
import MeasurementTool from './MeasurementTool';

interface CameraControllerProps {
  loadedGroup: THREE.Group | null;
}

// Component to handle camera changes based on state and loaded model bounding boxes
const CameraController: React.FC<CameraControllerProps> = ({ loadedGroup }) => {
  const { camera, controls } = useThree();
  const cameraMode = useUIStore((state) => state.cameraMode);
  
  const focusedEntityId = useUIStore((state) => state.focusedEntityId);
  const setFocusedEntityId = useUIStore((state) => state.setFocusedEntityId);
  const currentWorldState = useWorldStore((state) => state.currentWorldState);

  // Targets for camera and controls target lerping
  const targetCamPos = React.useRef<THREE.Vector3 | null>(null);
  const targetLookAt = React.useRef<THREE.Vector3 | null>(null);

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

  // Handle Focus Entity lerping
  React.useEffect(() => {
    if (!focusedEntityId || !currentWorldState) return;
    const entity = currentWorldState.entities[focusedEntityId];
    if (!entity) return;

    // Calculate center point coordinates of targeted entity
    const pos = entity.transform.position;
    const min = entity.boundingBox.min;
    const max = entity.boundingBox.max;
    
    const sizeX = max[0] - min[0];
    const sizeY = max[1] - min[1];
    const sizeZ = max[2] - min[2];
    const maxDim = Math.max(sizeX, sizeY, sizeZ) || 1.0;
    
    // Fit camera distance relative to entity dimensions
    const perspectiveCam = camera as THREE.PerspectiveCamera;
    const fovRad = (perspectiveCam.fov ? (perspectiveCam.fov * Math.PI) / 180 : 0.7);
    let distance = maxDim / (2 * Math.tan(fovRad / 2));
    distance = Math.max(distance * 2.2, 2.0); // Safe scale offset padding

    targetLookAt.current = new THREE.Vector3(pos[0], pos[1], pos[2]);
    targetCamPos.current = new THREE.Vector3(
      pos[0] + distance * 0.7,
      pos[1] + distance * 0.7,
      pos[2] + distance * 0.7
    );
  }, [focusedEntityId, currentWorldState, camera]);

  useFrame(() => {
    if (targetCamPos.current && targetLookAt.current) {
      camera.position.lerp(targetCamPos.current, 0.08);
      
      const orbitControls = controls as any;
      if (orbitControls) {
        orbitControls.target.lerp(targetLookAt.current, 0.08);
        orbitControls.update();
      }

      if (camera.position.distanceTo(targetCamPos.current) < 0.02 && 
          (!orbitControls || orbitControls.target.distanceTo(targetLookAt.current) < 0.02)) {
        targetCamPos.current = null;
        targetLookAt.current = null;
        setFocusedEntityId(null); // Release focus latch once aligned
      }
    }
  });

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
  isolatedEntityId: string | null;

  // Annotation UX
  annotationModeActive: boolean;
  addAnnotation: (annotation: any) => void;

  // Real GLB loader integrations
  worldSource: 'MOCK' | 'PRESET_GLB' | 'USER_GLB';
  activeModelInfo: any;
  onLoadSuccess: (scene: THREE.Group, meta: any) => void;

  // Comparison UX
  isReferenceMesh?: boolean;
  comparisonActive?: boolean;
  comparisonMode?: string;
  comparisonOpacity?: number;
  alignmentOffset?: [number, number, number];
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
  isolatedEntityId,
  annotationModeActive,
  addAnnotation,
  isReferenceMesh = false,
  comparisonActive = false,
  comparisonMode = 'OVERLAY',
  comparisonOpacity = 0.5,
  alignmentOffset = [0, 0, 0],
}) => {
  const geomProps = useMemo(() => getGeometryProps(entity.geometry), [entity.geometry]);
  const meshRef = useRef<THREE.Mesh>(null);
  const [useFallback, setUseFallback] = React.useState(false);

  // Position displacement calculation (Exploded view radial offset + semantic decomposition + comparison offset)
  const basePos = simState?.position || entity.transform.position;
  const position = useMemo(() => {
    let x = basePos[0];
    let y = basePos[1];
    let z = basePos[2];

    if (explosionFactor > 0) {
      x *= (1 + explosionFactor * 0.4);
      y *= (1 + explosionFactor * 0.4);
      z *= (1 + explosionFactor * 0.4);
    }

    if (visualizationMode === 'semantic' && entity.parentId !== null) {
      const len = Math.sqrt(x * x + y * y + z * z) || 1.0;
      x += (x / len) * 1.5;
      y += (y / len) * 1.5;
      z += (z / len) * 1.5;
    }

    if (isReferenceMesh) {
      const offset = comparisonMode === 'SIDE_BY_SIDE' ? [8, 0, 0] : alignmentOffset;
      x += offset[0];
      y += offset[1];
      z += offset[2];
    }

    return [x, y, z] as [number, number, number];
  }, [basePos, explosionFactor, visualizationMode, entity.parentId, isReferenceMesh, comparisonMode, alignmentOffset]);

  const rotation = simState?.rotation || entity.transform.rotation;
  const scale = simState?.scale || entity.transform.scale;

  // Custom colors depending on Mode
  const semanticClasses = useWorldStore((state) => state.currentWorldState?.semanticClasses);
  const semanticColor = semanticClasses?.[entity.semanticClass]?.color ?? '#94a3b8';

  const materialColor = useMemo(() => {
    if (isReferenceMesh) {
      return comparisonMode === 'DIFFERENCE' ? '#be123c' : '#7c3aed'; // Deep Red vs Violet reference
    }
    if (comparisonActive && comparisonMode === 'DIFFERENCE') {
      return '#047857'; // Emerald green reconstruction in Difference mode
    }
    if (simState?.color) return simState.color;
    if (entity.visualOverrides?.color) return entity.visualOverrides.color;
    
    if (visualizationMode === 'semantic') {
      return semanticColor;
    }
    if (visualizationMode === 'confidence') {
      if (entity.confidence >= 0.9) return '#C4B5FD'; // High: Lavender
      if (entity.confidence >= 0.7) return '#D4AF6A'; // Medium: Gold
      return '#be123c'; // Low: Muted Amber/Red
    }
    if (visualizationMode === 'holo') {
      return '#DDD6FE'; // Bright Lavender
    }
    return '#4b5563'; // standard grey
  }, [entity, visualizationMode, semanticColor, simState, isReferenceMesh, comparisonActive, comparisonMode]);

  // Click handler
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    if (measurementMode) {
      onClickPoint([e.point.x, e.point.y, e.point.z]);
    } else {
      onSelect(entity.id);
    }
  };

  const lowConfidenceFilterActive = useUIStore((state) => state.lowConfidenceFilterActive);
  const filteredSemanticClasses = useUIStore((state) => state.filteredSemanticClasses);
  const showDebugBounds = useUIStore((state) => state.showDebugBounds);
  const isVisible = entity.visualOverrides?.visible !== false;

  // ── Geometry role filter (domain-agnostic) ────────────────────────────────
  // BOUNDARY_HELPER entities exist for spatial math (camera fit, isolation,
  // relationships, clipping) but must NOT be rendered by default.
  // They only appear when showDebugBounds is explicitly enabled.
  if (entity.geometry.geometryRole === 'BOUNDARY_HELPER' && !showDebugBounds) {
    return null;
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Hide non-low confidence entities when low confidence filter is active
  if (lowConfidenceFilterActive && entity.confidence >= 0.7 && entity.id !== 'asset_root') {
    return null;
  }

  // Hide entities belonging to filtered semantic classes
  if (filteredSemanticClasses.includes(entity.semanticClass)) {
    return null;
  }
  
  if (!isVisible) return null;

  // Set up materials
  const isIsolated = isolatedEntityId !== null;
  const isThisIsolated = isolatedEntityId === entity.id;
  const shouldGhost = isIsolated && !isThisIsolated && entity.id !== 'asset_root';

  const opacity = shouldGhost 
    ? 0.05 
    : (isReferenceMesh 
        ? comparisonOpacity 
        : (visualizationMode === 'x-ray' || visualizationMode === 'ghost' 
            ? 0.25 
            : (visualizationMode === 'holo' ? 0.15 : (entity.visualOverrides?.opacity ?? 1.0))));

  const transparent = shouldGhost || isReferenceMesh || opacity < 1.0;

  const standardMaterial = (
    <meshStandardMaterial
      color={materialColor}
      transparent={transparent}
      opacity={opacity}
      roughness={0.4}
      metalness={0.2}
      clippingPlanes={clippingPlanes}
      depthWrite={visualizationMode !== 'x-ray' && !shouldGhost}
      emissive={visualizationMode === 'holo' ? materialColor : '#000000'}
      emissiveIntensity={visualizationMode === 'holo' ? 0.3 : 0.0}
    />
  );

  const wireframeMaterial = (
    <meshBasicMaterial
      color={visualizationMode === 'holo' ? '#DDD6FE' : '#64748b'}
      wireframe={true}
      clippingPlanes={clippingPlanes}
      transparent={true}
      opacity={shouldGhost ? 0.02 : 0.8}
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
            color={isSelected ? '#C4B5FD' : '#e2e8f0'}
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
          onDoubleClick={(e) => {
            if (annotationModeActive) {
              e.stopPropagation();
              const intersectionPoint = [e.point.x, e.point.y, e.point.z] as [number, number, number];
              const text = prompt('Enter annotation text:');
              if (text && text.trim()) {
                const typeInput = prompt('Enter type (note, warning, measurement, insight):', 'note');
                const inputLower = typeInput?.toLowerCase().trim() ?? 'note';
                let cleanType: any = 'note';
                if (inputLower === 'warning') cleanType = 'warning';
                else if (inputLower === 'measurement') cleanType = 'measurement';
                else if (inputLower === 'insight' || inputLower === 'ai_explanation') cleanType = 'ai_explanation';

                addAnnotation({
                  id: `ann_${Date.now()}`,
                  entityId: entity.id,
                  type: cleanType,
                  text: text.trim(),
                  position: intersectionPoint,
                  author: 'user',
                  timestamp: Date.now()
                });
              }
            }
          }}
        >
          <GLTFModel
            url={entity.geometry.glbPath}
            filename={activeModelInfo?.filename ?? 'model.glb'}
            source={worldSource}
            fileSize={activeModelInfo?.fileSize}
            clippingPlanes={clippingPlanes}
            visualizationMode={shouldGhost ? 'ghost-isolated' : visualizationMode}
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
            onDoubleClick={(e) => {
              if (annotationModeActive) {
                e.stopPropagation();
                const intersectionPoint = [e.point.x, e.point.y, e.point.z] as [number, number, number];
                const text = prompt('Enter annotation text:');
                if (text && text.trim()) {
                  const typeInput = prompt('Enter type (note, warning, measurement, insight):', 'note');
                  const inputLower = typeInput?.toLowerCase().trim() ?? 'note';
                  let cleanType: any = 'note';
                  if (inputLower === 'warning') cleanType = 'warning';
                  else if (inputLower === 'measurement') cleanType = 'measurement';
                  else if (inputLower === 'insight' || inputLower === 'ai_explanation') cleanType = 'ai_explanation';

                  addAnnotation({
                    id: `ann_${Date.now()}`,
                    entityId: entity.id,
                    type: cleanType,
                    text: text.trim(),
                    position: intersectionPoint,
                    author: 'user',
                    timestamp: Date.now()
                  });
                }
              }
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
  const addAnnotation = useWorldStore((state) => state.addAnnotation);
  
  const worldSource = useWorldStore((state) => state.worldSource);
  const activeModelInfo = useWorldStore((state) => state.activeModelInfo);
  const setActiveModelInfo = useWorldStore((state) => state.setActiveModelInfo);
  const animatedMeshes = useWorldStore((state) => state.animatedMeshes);

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
    setCameraMode,
    
    // Phase 2 Relationship states
    showRelationships,
    showRelationshipLabels,
    selectedRelationshipId,
    setSelectedRelationshipId,
    isolatedEntityId,
    comparisonActive,
    comparisonMode,
    comparisonOpacity,
    alignmentOffset
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

  const setFocusedEntityId = useUIStore((state) => state.setFocusedEntityId);
  const annotationModeActive = useUIStore((state) => state.annotationModeActive);

  // Keyboard shortcut listener inside Viewport
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ensure target isn't input text box
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.key === 'r' || e.key === 'R') {
        setCameraMode('orbit');
      }
      if (e.key === 'f' || e.key === 'F') {
        if (selectedEntityId) {
          setFocusedEntityId(selectedEntityId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCameraMode, selectedEntityId, setFocusedEntityId]);


  return (
    <div className="canvas-wrapper">
      <Canvas
        gl={{ localClippingEnabled: true, antialias: true }}
        camera={{ position: [8, 8, 8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#07060D']} />
        
        {/* Technical/Dynamic Studio Lighting Rig */}
        <ambientLight intensity={1.2} />
        <hemisphereLight color="#ffffff" groundColor="#0f172a" intensity={0.8} />
        <pointLight position={[15, 20, 15]} intensity={2.5} />
        <directionalLight position={[-15, 15, -10]} intensity={2.0} />
        <directionalLight position={[10, -10, 10]} intensity={0.5} />

        <CameraController loadedGroup={loadedGroup} />
        <OrbitControls makeDefault maxPolarAngle={Math.PI / 2 + 0.1} />

        {/* Phase 4 R3F Extensions */}
        <HoloScanPlane />
        <SemanticLabels />
        <MeasurementTool />

        {/* Technical Grid - Hidden when model is displayed */}
        {!(animatedMeshes && animatedMeshes.length > 0) && (
          <group>
            <gridHelper args={[30, 30, '#1e293b', '#0f172a']} position={[0, -0.05, 0]} />
            <axesHelper args={[4]} />
          </group>
        )}

        {/* 2D-to-3D Dot Mesh Animation Sequence */}
        {animatedMeshes && animatedMeshes.length > 0 && (
          <AnimatedDotMesh meshUrls={animatedMeshes} />
        )}

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
              isolatedEntityId={isolatedEntityId}
              annotationModeActive={annotationModeActive}
              addAnnotation={addAnnotation}
              comparisonActive={comparisonActive}
              comparisonMode={comparisonMode}
            />
          ))}

        {/* Reference Meshes (Comparison Mode) */}
        {comparisonActive && currentWorldState && Object.values(currentWorldState.entities).map((entity) => (
          <EntityMesh
            key={`${entity.id}_ref`}
            entity={entity}
            visualizationMode="ghost"
            explosionFactor={explosionFactor}
            simState={entitySimulationStates[entity.id]}
            clippingPlanes={clippingPlanes}
            isSelected={false}
            isHovered={false}
            onSelect={() => {}}
            onHover={() => {}}
            onClickPoint={() => {}}
            measurementMode={false}
            worldSource={worldSource}
            activeModelInfo={activeModelInfo}
            onLoadSuccess={() => {}}
            isolatedEntityId={null}
            annotationModeActive={false}
            addAnnotation={() => {}}
            isReferenceMesh={true}
            comparisonActive={comparisonActive}
            comparisonMode={comparisonMode}
            comparisonOpacity={comparisonOpacity}
            alignmentOffset={alignmentOffset}
          />
        ))}

        {/* Draw 3D Relationship Connection Lines */}
        {showRelationships && currentWorldState &&
          currentWorldState.relationships.map((rel) => {
            const sourceEntity = currentWorldState.entities[rel.source];
            const targetEntity = currentWorldState.entities[rel.target];
            if (!sourceEntity || !targetEntity) return null;

            const p1 = sourceEntity.transform.position;
            const p2 = targetEntity.transform.position;

            const midpoint: [number, number, number] = [
              (p1[0] + p2[0]) / 2,
              (p1[1] + p2[1]) / 2,
              (p1[2] + p2[2]) / 2
            ];

            const isSelected = selectedRelationshipId === rel.id;
            const isLabelVisible = showRelationshipLabels || isSelected;

            return (
              <group key={rel.id}>
                <Line
                  points={[
                    new THREE.Vector3(p1[0], p1[1], p1[2]),
                    new THREE.Vector3(p2[0], p2[1], p2[2])
                  ]}
                  color={isSelected ? '#D4AF6A' : '#A78BFA'}
                  lineWidth={isSelected ? 2.5 : 1.25}
                  dashed={true}
                  dashScale={4}
                  dashSize={0.5}
                  gapSize={0.3}
                />
                
                {isLabelVisible && (
                  <Html position={midpoint} distanceFactor={8} center>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRelationshipId(isSelected ? null : rel.id);
                      }}
                      style={{
                        padding: '2px 6px',
                        background: isSelected ? 'var(--vf-panel-elevated)' : 'rgba(13, 10, 24, 0.85)',
                        border: `1px solid ${isSelected ? 'var(--vf-gold)' : 'var(--vf-border)'}`,
                        color: isSelected ? 'var(--vf-gold-soft)' : 'var(--vf-text-secondary)',
                        borderRadius: '3px',
                        fontSize: '9px',
                        fontFamily: 'var(--font-mono)',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                        userSelect: 'none'
                      }}
                    >
                      {rel.type.toUpperCase()} {rel.properties?.confidence ? `(${Math.round((rel.properties.confidence as number) * 100)}%)` : ''}
                    </div>
                  </Html>
                )}
              </group>
            );
          })}

        {/* Draw 3D Floating Annotations */}
        {currentWorldState &&
          Object.values(currentWorldState.annotations).map((ann) => {
            const getAnnotationStyle = () => {
              switch (ann.type) {
                case 'warning':
                  return { bg: 'rgba(185, 28, 28, 0.95)', border: '1px solid var(--accent-red)', icon: '⚠️' };
                case 'ai_explanation':
                  return { bg: 'rgba(212, 175, 106, 0.95)', border: '1px solid var(--vf-gold)', icon: '✨' };
                case 'measurement':
                  return { bg: 'rgba(124, 58, 237, 0.95)', border: '1px solid var(--vf-lavender)', icon: '📐' };
                case 'note':
                default:
                  return { bg: 'rgba(20, 24, 34, 0.95)', border: '1px solid var(--vf-violet)', icon: '📝' };
              }
            };
            const style = getAnnotationStyle();
            return (
              <Html key={ann.id} position={ann.position} distanceFactor={8}>
                <div
                  style={{
                    padding: '3px 8px',
                    background: style.bg,
                    border: style.border,
                    color: '#fff',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                  onClick={() => ann.entityId && selectEntity(ann.entityId)}
                  title={ann.text}
                >
                  {style.icon} {ann.text.length > 20 ? `${ann.text.substring(0, 20)}...` : ann.text}
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





      {/* Semantic Map Legend overlay */}
      {visualizationMode === 'semantic' && currentWorldState && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 4,
            background: 'var(--vf-panel-elevated)',
            border: '1px solid var(--vf-border)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--vf-text-primary)', letterSpacing: '0.5px' }}>
            SEMANTIC MAP
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxWidth: '240px' }}>
            {Object.values(currentWorldState.semanticClasses).map((cls) => (
              <div key={cls.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cls.color }} />
                <span style={{ color: 'var(--vf-text-secondary)' }}>{cls.name.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Mode HUD Overlay */}
      {comparisonActive && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '60px', 
            right: '20px', 
            zIndex: 4,
            background: 'var(--vf-panel-elevated)',
            border: '1px solid var(--vf-gold)',
            borderRadius: '6px',
            padding: '8px 12px',
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--vf-gold-soft)',
            boxShadow: '0 4px 15px rgba(212, 175, 106, 0.25)',
            backdropFilter: 'blur(8px)'
          }}
        >
          ⚙️ DEMO COMPARISON ACTIVE ({comparisonMode})
          <div style={{ fontSize: '8px', color: 'var(--vf-text-muted)', marginTop: '2px' }}>
            ALIGN OFFSET: [{alignmentOffset.map(v => v.toFixed(2)).join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
};
export default Viewport;
