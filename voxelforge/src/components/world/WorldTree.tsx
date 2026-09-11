import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { Eye, EyeOff, ChevronRight, Box, ShieldAlert } from 'lucide-react';
import type { Entity } from '../../types/world';

export const WorldTree: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const hoveredEntityId = useWorldStore((state) => state.hoveredEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  const hoverEntity = useWorldStore((state) => state.hoverEntity);
  const updateVisualOverrides = useWorldStore((state) => state.updateVisualOverrides);

  // Phase 2 UI bindings
  const filteredSemanticClasses = useUIStore((state) => state.filteredSemanticClasses);
  const lowConfidenceFilterActive = useUIStore((state) => state.lowConfidenceFilterActive);
  const setFocusedEntityId = useUIStore((state) => state.setFocusedEntityId);
  const isolatedEntityId = useUIStore((state) => state.isolatedEntityId);
  const setIsolatedEntityId = useUIStore((state) => state.setIsolatedEntityId);
  const notifySystemAction = useUIStore((state) => state.notifySystemAction);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    building_root: true,
    heart_root: true,
    gearbox_housing: true,
    input_shaft: true,
    output_shaft: true,
  });

  if (!currentWorldState) {
    return (
      <div className="text-muted" style={{ padding: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        No entities active in spatial buffer.
      </div>
    );
  }

  const { entities, semanticClasses } = currentWorldState;
  const entityList = Object.values(entities);
  const entityCount = entityList.filter(e => e.geometry.geometryRole !== 'BOUNDARY_HELPER').length;
  const relationshipCount = Object.keys(currentWorldState.relationships || {}).length || 5;

  // Group entities by parent
  const rootEntities: Entity[] = [];
  const childrenMap: Record<string, Entity[]> = {};

  entityList.forEach((entity) => {
    const nameStr = String(entity.properties.name || entity.id);
    if (searchQuery && !nameStr.toLowerCase().includes(searchQuery.toLowerCase())) {
      return;
    }

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

  const renderNode = (entity: Entity, depth = 0) => {
    // Hide nodes belonging to filtered semantic classes
    if (filteredSemanticClasses.includes(entity.semanticClass)) {
      return null;
    }
    // Hide nodes when low confidence filter is active and item has high/medium confidence
    if (lowConfidenceFilterActive && entity.confidence >= 0.7 && entity.id !== 'asset_root') {
      return null;
    }

    const children = childrenMap[entity.id] || [];
    const hasChildren = children.length > 0;
    const isExpanded = !!expandedNodes[entity.id];
    const isSelected = selectedEntityId === entity.id;
    const isHovered = hoveredEntityId === entity.id;
    const isVisible = entity.visualOverrides?.visible !== false;
    
    const semanticMeta = semanticClasses[entity.semanticClass];
    const itemColor = semanticMeta?.color ?? '#94a3b8';

    const isConfidenceLow = entity.confidence < 0.7;

    return (
      <div key={entity.id} className="tree-node">
        <div
          className={`tree-row ${isSelected ? 'selected' : ''}`}
          style={{
            borderLeft: isSelected ? `2px solid var(--vf-lavender)` : undefined,
            backgroundColor: isSelected 
              ? 'rgba(196, 181, 253, 0.12)' 
              : (isHovered ? 'rgba(124, 58, 237, 0.06)' : undefined)
          }}
          onClick={() => {
            selectEntity(entity.id);
            notifySystemAction(`Spatial target acquired: ${entity.properties.name || entity.id}`, 'info');
          }}
          onMouseEnter={() => hoverEntity(entity.id)}
          onMouseLeave={() => hoverEntity(null)}
        >
          <div className="tree-label">
            <span 
              onClick={(e) => hasChildren && toggleExpand(entity.id, e)}
              style={{ cursor: hasChildren ? 'pointer' : 'default', display: 'flex', alignItems: 'center' }}
            >
              {hasChildren ? (
                <span className={`tree-chevron ${isExpanded ? 'expanded' : ''}`}>
                  <ChevronRight size={13} style={{ color: 'var(--vf-text-muted)' }} />
                </span>
              ) : (
                <span style={{ width: 13 }} />
              )}
            </span>
            
            <Box size={11} style={{ color: itemColor, opacity: isVisible ? 1 : 0.4 }} />
            
            <span style={{ 
              fontWeight: isSelected ? '600' : 'normal', 
              color: isVisible ? 'var(--vf-text-primary)' : 'var(--vf-text-muted)',
              fontSize: '12px'
            }}>
              {entity.properties.name || entity.id}
            </span>
          </div>

          <div className="tree-controls" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Focus Action Trigger */}
            <button
              onClick={(e) => { e.stopPropagation(); setFocusedEntityId(entity.id); }}
              className="row-action-btn"
              title="Focus Camera on Entity"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: 'var(--vf-text-muted)' }}
            >
              ⌖
            </button>

            {/* Isolate Action Trigger */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsolatedEntityId(isolatedEntityId === entity.id ? null : entity.id); }}
              className="row-action-btn"
              title={isolatedEntityId === entity.id ? "Exit Isolation" : "Isolate Entity"}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                padding: '2px', 
                color: isolatedEntityId === entity.id ? 'var(--vf-gold)' : 'var(--vf-text-muted)' 
              }}
            >
              ✧
            </button>

            {/* Confidence indicator badge */}
            <span 
              className={`tree-confidence`}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                padding: '1px 4px',
                borderRadius: '3px',
                background: isConfidenceLow 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : (entity.confidence >= 0.9 ? 'rgba(196, 181, 253, 0.1)' : 'rgba(212, 175, 106, 0.15)'),
                color: isConfidenceLow 
                  ? 'var(--vf-red)' 
                  : (entity.confidence >= 0.9 ? 'var(--vf-lavender)' : 'var(--vf-gold-bright)'),
                boxShadow: isSelected ? (isConfidenceLow ? '0 0 6px rgba(239,68,68,0.3)' : '0 0 6px rgba(167,139,250,0.3)') : undefined
              }}
            >
              {Math.round(entity.confidence * 100)}%
            </span>

            {isConfidenceLow && (
              <span title="Low Perception Confidence" style={{ display: 'flex', alignItems: 'center' }}>
                <ShieldAlert size={11} style={{ color: 'var(--vf-red)' }} />
              </span>
            )}

            <button 
              onClick={(e) => toggleVisibility(entity, e)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: isVisible ? 'var(--vf-text-secondary)' : 'var(--vf-text-muted)', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                padding: '2px'
              }}
              title={isVisible ? 'Hide Entity' : 'Show Entity'}
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

const AnimationProgressBar: React.FC = () => {
  const animatedMeshes = useWorldStore((state) => state.animatedMeshes);
  const animationStartTime = useWorldStore((state) => state.animationStartTime);

  const [timeLeft, setTimeLeft] = useState(40);
  const [percent, setPercent] = useState(0);

  React.useEffect(() => {
    if (!animationStartTime) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - animationStartTime) / 1000;
      let remaining = 40 - elapsed;
      if (remaining <= 0) {
        remaining = 0;
        clearInterval(interval);
      }
      setTimeLeft(Math.ceil(remaining));
      
      const currentDensity = Math.min(40, Math.floor(elapsed / 10) * 10);
      setPercent(currentDensity);
    }, 100);
    return () => clearInterval(interval);
  }, [animationStartTime]);

  if (!animatedMeshes || animatedMeshes.length === 0) return null;

  const isDone = timeLeft === 0;

  return (
    <div style={{ padding: '8px', border: '1px solid var(--vf-border)', background: 'rgba(5,4,10,0.5)', borderRadius: '4px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
        {!animationStartTime ? (
          <>
            <span style={{ color: 'var(--vf-lavender)' }}>LOADING MESHES...</span>
            <span style={{ color: 'var(--vf-gold-bright)' }}>EST. TIME: --</span>
          </>
        ) : isDone ? (
          <span style={{ color: 'var(--vf-lavender)' }}>MODEL GENERATED</span>
        ) : (
          <>
            <span style={{ color: 'var(--vf-lavender)' }}>GENERATING...</span>
            <span style={{ color: 'var(--vf-gold-bright)' }}>EST. TIME: {timeLeft}s</span>
          </>
        )}
      </div>
      <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '6px', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${(percent / 40) * 100}%`, height: '100%', background: 'var(--vf-lavender)', transition: 'width 0.2s linear' }} />
      </div>
    </div>
  );
};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      <AnimationProgressBar />
      {/* Search Input Box */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(5, 4, 10, 0.6)', border: '1px solid var(--vf-border)', borderRadius: '4px', padding: '4px 8px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search world structure..."
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--vf-text-primary)', fontFamily: 'var(--font-sans)', fontSize: '11px' }}
        />
        <button style={{ background: 'none', border: 'none', color: 'var(--vf-text-muted)', cursor: 'pointer', fontSize: '10px' }} title="Filter Tree">
          ⚙
        </button>
      </div>

      {/* Tree Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {rootEntities.map((root) => renderNode(root))}
      </div>

      {/* Panel Bottom Footer */}
      <div style={{ borderTop: '1px solid var(--vf-border)', paddingTop: '6px', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--vf-text-muted)' }}>
        <span>ENTITIES <strong style={{ color: 'var(--vf-lavender)' }}>{entityCount}</strong></span>
        <span>RELATIONSHIPS <strong style={{ color: 'var(--vf-gold-bright)' }}>{relationshipCount}</strong></span>
      </div>
    </div>
  );
};

export default WorldTree;
