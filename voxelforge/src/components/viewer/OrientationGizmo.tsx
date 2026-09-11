import React from 'react';
import { useUIStore } from '../../state/useUIStore';

export const OrientationGizmo: React.FC = () => {
  const cameraMode = useUIStore((state) => state.cameraMode);
  const setCameraMode = useUIStore((state) => state.setCameraMode);

  return (
    <div
      style={{
        position: 'absolute',
        top: '75px',
        right: '16px',
        zIndex: 25,
        width: '48px',
        height: '48px',
        perspective: '200px',
        cursor: 'pointer'
      }}
      onClick={() => setCameraMode(cameraMode === 'orbit' ? 'isometric' : 'orbit')}
      title="3D Orientation Gizmo (Click to switch view)"
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-20deg) rotateY(35deg)',
          transition: 'transform 0.3s ease'
        }}
      >
        {/* Wireframe Cube Faces */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '1px solid rgba(196, 181, 253, 0.4)',
            background: 'rgba(124, 58, 237, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '7px',
            color: 'var(--vf-lavender)',
            boxShadow: 'inset 0 0 10px rgba(124, 58, 237, 0.2)'
          }}
        >
          TOP
        </div>
      </div>
    </div>
  );
};

export default OrientationGizmo;
