# WorldTree.tsx

``tsx
import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { Eye, EyeOff, ChevronDown, ChevronRight, Box, ShieldAlert } from 'lucide-react';
import type { Entity } from '../../types/world';

export const WorldTree: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const hoveredEntityId = useWorldStore((state) => state.hoveredEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  const hoverEntity = useWorldStore((state) => state.hoverEntity);
  const updateVisualOverrides = useWorldStore((state) => state.updateVisualOverrides);

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    building_root: true,
    heart_root: true,
    gearbox_housing: true,
    input_shaft: true,
    output_shaft: true,
  });

  if (!currentWorldState) {
    return (
      <div className="text-muted" style={{ padding: '8px', fontSize: '12px' }}>
        No entities loaded. Upload or select a mock project.
      </div>
    );
  }

  const { entities, semanticClasses } = currentWorldState;

  // Group entities by parent
  const rootEntities: Entity[] = [];
  const childrenMap: Record<string, Entity[]> = {};

  Object.values(entities).forEach((entity) => {
    if (!entity.parentId) {
      rootEntities.push(entity);
    } else {
      if (!childrenMap[entity.parentId]) {
        childrenMap[entity.parentId] = [];
      }
      childrenMap[entity.parentId].push(entity);
    }
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVisibility = (entity: Entity, e: React.MouseEvent) => {
    e.stopPropagation();
    const isVisible = entity.visualOverrides?.visible !== false;
    updateVisualOverrides(entity.id, { visible: !isVisible });
  };

  const getConfidenceClass = (conf: number) => {
    if (conf >= 0.9) return 'confidence-high';
    if (conf >= 0.7) return 'confidence-med';
    return 'confidence-low';
  };

  const renderNode = (entity: Entity, depth = 0) => {
    const children = childrenMap[entity.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[entity.id];
    const isSelected = selectedEntityId === entity.id;
    const isHovered = hoveredEntityId === entity.id;
    const isVisible = entity.visualOverrides?.visible !== false;
    
    const semanticMeta = semanticClasses[entity.semanticClass];
    const itemColor = semanticMeta?.color ?? '#94a3b8';

    return (
      <div key={entity.id} className="tree-node" style={{ marginLeft: `${depth * 10}px` }}>
        <div
          className={`tree-row ${isSelected ? 'selected' : ''}`}
          style={{
            borderLeft: isSelected ? `2px solid ${itemColor}` : undefined,
            backgroundColor: isHovered && !isSelected ? 'var(--bg-hover)' : undefined
          }}
          onClick={() => selectEntity(entity.id)}
          onMouseEnter={() => hoverEntity(entity.id)}
          onMouseLeave={() => hoverEntity(null)}
        >
          <div className="tree-label">
            <span 
              onClick={(e) => hasChildren && toggleExpand(entity.id, e)}
              style={{ cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
              ) : (
                <span style={{ width: 14 }} />
              )}
            </span>
            
            <Box size={12} style={{ color: itemColor }} />
            
            <span style={{ fontWeight: isSelected ? 'bold' : 'normal' }}>
              {entity.properties.name || entity.id}
            </span>
            
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              ({entity.semanticClass})
            </span>
          </div>

          <div className="tree-controls">
            <span className={`confidence-badge ${getConfidenceClass(entity.confidence)}`}>
              {Math.round(entity.confidence * 100)}%
            </span>

            {entity.confidence < 0.7 && (
              <span title="Low detection confidence" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldAlert size={12} style={{ color: 'var(--accent-red)' }} />
              </span>
            )}

            <button 
              onClick={(e) => toggleVisibility(entity, e)}
              style={{ background: 'none', border: 'none', color: isVisible ? 'var(--text-secondary)' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="tree-children">
            {children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {rootEntities.map((root) => renderNode(root))}
    </div>
  );
};
export default WorldTree;

``