import React from 'react';
import { Html } from '@react-three/drei';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';

export const SemanticLabels: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const visualizationMode = useUIStore((state) => state.visualizationMode);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  const filteredSemanticClasses = useUIStore((state) => state.filteredSemanticClasses);

  if (visualizationMode !== 'semantic' || !currentWorldState) return null;

  const { entities, semanticClasses } = currentWorldState;

  return (
    <>
      {Object.values(entities).map((entity) => {
        // Skip boundary helper entities and filtered semantic classes
        if (entity.geometry.geometryRole === 'BOUNDARY_HELPER') return null;
        if (filteredSemanticClasses.includes(entity.semanticClass)) return null;

        const pos = entity.transform.position;
        const semanticMeta = semanticClasses[entity.semanticClass];
        const classColor = semanticMeta?.color ?? '#94a3b8';
        const isSelected = selectedEntityId === entity.id;

        return (
          <Html
            key={`sem_label_${entity.id}`}
            position={[pos[0], pos[1] + (entity.boundingBox ? (entity.boundingBox.max[1] - entity.boundingBox.min[1]) * 0.4 + 0.3 : 1.2), pos[2]]}
            center
            distanceFactor={10}
            zIndexRange={[20, 0]}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
                selectEntity(entity.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 8px',
                background: isSelected ? 'var(--vf-panel-elevated)' : 'rgba(13, 10, 24, 0.82)',
                border: `1px solid ${isSelected ? 'var(--vf-gold)' : 'var(--vf-border-active)'}`,
                borderRadius: '4px',
                boxShadow: isSelected ? '0 0 14px rgba(212, 175, 106, 0.3)' : '0 4px 16px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: classColor }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
                <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 600, color: 'var(--vf-text-primary)' }}>
                  {entity.properties.name || entity.id}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-lavender)' }}>
                  {entity.semanticClass.toUpperCase()} • {Math.round(entity.confidence * 100)}%
                </span>
              </div>
            </div>
          </Html>
        );
      })}
    </>
  );
};

export default SemanticLabels;
