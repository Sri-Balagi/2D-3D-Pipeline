import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useUIStore } from '../../state/useUIStore';
import { useWorldStore } from '../../state/useWorldStore';

export const MeasurementTool: React.FC = () => {
  const measurementMode = useUIStore((state) => state.measurementMode);
  const measurementPoints = useUIStore((state) => state.measurementPoints);
  const currentWorldState = useWorldStore((state) => state.currentWorldState);

  const p1 = measurementPoints[0];
  const p2 = measurementPoints[1];

  const distanceText = useMemo(() => {
    if (!p1 || !p2 || !currentWorldState) return null;
    const distMeters = Math.sqrt(
      Math.pow(p1[0] - p2[0], 2) +
      Math.pow(p1[1] - p2[1], 2) +
      Math.pow(p1[2] - p2[2], 2)
    );
    const scale = currentWorldState.metadata.scale ?? 1.0;
    const distUnits = distMeters / scale;
    return `${distUnits.toFixed(2)} ${currentWorldState.metadata.units}`;
  }, [p1, p2, currentWorldState]);

  if (!measurementMode && measurementPoints.length === 0) return null;

  return (
    <group>
      {/* Point X Marker */}
      {p1 && (
        <group position={p1}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#D4AF6A" />
          </mesh>
          <mesh>
            <ringGeometry args={[0.12, 0.16, 24]} />
            <meshBasicMaterial color="#E7C982" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          <Html position={[0, 0.25, 0]} center distanceFactor={8}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                padding: '3px 8px',
                background: 'rgba(13, 10, 24, 0.92)',
                border: '1px solid var(--vf-gold)',
                color: 'var(--vf-gold-bright)',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 12px rgba(212, 175, 106, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>POINT X</span>
              <span style={{ fontSize: '7px', color: 'var(--vf-text-muted)' }}>
                [{p1.map(v => v.toFixed(3)).join(', ')}]
              </span>
            </div>
          </Html>
        </group>
      )}

      {/* Point Y Marker */}
      {p2 && (
        <group position={p2}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#D4AF6A" />
          </mesh>
          <mesh>
            <ringGeometry args={[0.12, 0.16, 24]} />
            <meshBasicMaterial color="#E7C982" side={THREE.DoubleSide} transparent opacity={0.8} />
          </mesh>
          <Html position={[0, 0.25, 0]} center distanceFactor={8}>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                padding: '3px 8px',
                background: 'rgba(13, 10, 24, 0.92)',
                border: '1px solid var(--vf-gold)',
                color: 'var(--vf-gold-bright)',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
                boxShadow: '0 0 12px rgba(212, 175, 106, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>POINT Y</span>
              <span style={{ fontSize: '7px', color: 'var(--vf-text-muted)' }}>
                [{p2.map(v => v.toFixed(3)).join(', ')}]
              </span>
            </div>
          </Html>
        </group>
      )}

      {/* 3D Connecting Line & Midpoint Distance Badge */}
      {p1 && p2 && distanceText && (
        <>
          <Line
            points={[
              new THREE.Vector3(...p1),
              new THREE.Vector3(...p2)
            ]}
            color="#D4AF6A"
            lineWidth={2.5}
            dashed={true}
            dashScale={6}
            dashSize={0.4}
            gapSize={0.2}
          />
          <Html
            position={[
              (p1[0] + p2[0]) / 2,
              (p1[1] + p2[1]) / 2 + 0.2,
              (p1[2] + p2[2]) / 2
            ]}
            center
            distanceFactor={8}
          >
            <div
              style={{
                padding: '4px 10px',
                background: 'rgba(23, 20, 38, 0.95)',
                border: '1px solid var(--vf-gold)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'var(--vf-gold-soft)',
                boxShadow: '0 0 16px rgba(212, 175, 106, 0.35)',
                backdropFilter: 'blur(12px)',
                whiteSpace: 'nowrap'
              }}
            >
              📏 {distanceText}
            </div>
          </Html>
        </>
      )}
    </group>
  );
};

export default MeasurementTool;
