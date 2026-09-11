import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { HelpCircle } from 'lucide-react';
import { getContextualInsight } from '../../services/spatialContext';

export const Inspector: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  
  const setFocusedEntityId = useUIStore((state) => state.setFocusedEntityId);
  const isolatedEntityId = useUIStore((state) => state.isolatedEntityId);
  const setIsolatedEntityId = useUIStore((state) => state.setIsolatedEntityId);
  
  const worldSource = useWorldStore((state) => state.worldSource);
  const activeModelInfo = useWorldStore((state) => state.activeModelInfo);

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Controlled Accordion State
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    spatial: true,
    geometry: false,
    properties: true,
    relationships: false,
    annotations: false,
    ai_insight: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'n/a';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  if (!currentWorldState) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: '24px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        NO SPATIAL WORKSPACE ACTIVE
      </div>
    );
  }

  // Helper to render section blocks
  const renderSection = (id: string, title: string, content: React.ReactNode, count?: number) => {
    const isExpanded = expandedSections[id];
    return (
      <div className="inspector-section" style={{ borderBottom: '1px solid var(--vf-border)' }}>
        <div 
          onClick={() => toggleSection(id)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 4px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            letterSpacing: '0.5px',
            color: isExpanded ? 'var(--vf-text-primary)' : 'var(--vf-text-muted)',
            textTransform: 'uppercase',
            fontWeight: 500,
            transition: 'color 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '8px', color: isExpanded ? 'var(--vf-lavender)' : 'var(--vf-text-muted)', transition: 'transform 0.15s' }}>
              {isExpanded ? '▼' : '▶'}
            </span>
            <span>{title}</span>
          </div>
          {count !== undefined && (
            <span style={{ fontSize: '10px', color: 'var(--vf-text-muted)' }}>({count})</span>
          )}
        </div>
        
        {isExpanded && (
          <div style={{ padding: '4px 4px 12px 4px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {content}
          </div>
        )}
      </div>
    );
  };

  // If in Real GLB mode and no node is selected (or root is selected), render the Model Telemetry dashboard directly
  if (worldSource !== 'MOCK' && activeModelInfo && (!selectedEntityId || selectedEntityId === 'asset_root')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--vf-border)', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '13px', color: 'var(--vf-text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
            {activeModelInfo.filename}
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--vf-gold-soft)', fontFamily: 'var(--font-mono)' }}>
            SOURCE: {activeModelInfo.source.toUpperCase()}
          </span>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {renderSection('spec', 'Asset Specification', (
            <table className="property-table">
              <tbody>
                <tr>
                  <th>Format</th>
                  <td>{activeModelInfo.fileType}</td>
                </tr>
                <tr>
                  <th>File Size</th>
                  <td>{formatBytes(activeModelInfo.fileSize)}</td>
                </tr>
                <tr>
                  <th>Domain</th>
                  <td style={{ color: 'var(--vf-lavender)', fontWeight: 'bold' }}>
                    {currentWorldState.metadata.domain.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <th>Model Units</th>
                  <td>{currentWorldState.metadata.units}</td>
                </tr>
              </tbody>
            </table>
          ))}

          {renderSection('geo_telemetry', 'Geometry Telemetry', (
            <table className="property-table">
              <tbody>
                <tr>
                  <th>Dimensions</th>
                  <td>
                    {activeModelInfo.dimensions.width.toFixed(2)} x {activeModelInfo.dimensions.height.toFixed(2)} x {activeModelInfo.dimensions.depth.toFixed(2)} {currentWorldState.metadata.units}
                  </td>
                </tr>
                <tr>
                  <th>Bounds Min</th>
                  <td>
                    [{activeModelInfo.boundingBox.min.map((v: number) => v.toFixed(2)).join(', ')}]
                  </td>
                </tr>
                <tr>
                  <th>Bounds Max</th>
                  <td>
                    [{activeModelInfo.boundingBox.max.map((v: number) => v.toFixed(2)).join(', ')}]
                  </td>
                </tr>
                <tr>
                  <th>Center</th>
                  <td>
                    [{activeModelInfo.center.map((v: number) => v.toFixed(2)).join(', ')}]
                  </td>
                </tr>
              </tbody>
            </table>
          ))}

          {renderSection('scene_graph', 'Scene Graph Structure', (
            <table className="property-table">
              <tbody>
                <tr>
                  <th>Scene Nodes</th>
                  <td>{activeModelInfo.nodeCount}</td>
                </tr>
                <tr>
                  <th>Mesh Nodes</th>
                  <td>{activeModelInfo.meshCount}</td>
                </tr>
                <tr>
                  <th>Root Name</th>
                  <td>{activeModelInfo.rootNodeName}</td>
                </tr>
                <tr>
                  <th>Asset ID</th>
                  <td>{activeModelInfo.assetId}</td>
                </tr>
              </tbody>
            </table>
          ))}
        </div>
      </div>
    );
  }

  const selectedEntity = selectedEntityId ? currentWorldState.entities[selectedEntityId] : null;

  if (!selectedEntity) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center', gap: '12px' }}>
        <span style={{ fontSize: '18px', color: 'var(--vf-lavender)', opacity: 0.8 }}>✦</span>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: 'var(--vf-lavender)', letterSpacing: '1px' }}>
          ENTITY INTELLIGENCE
        </div>
        <p style={{ fontSize: '11px', color: 'var(--vf-text-secondary)', lineHeight: '1.6', maxWidth: '220px' }}>
          Select a spatial entity to inspect its structure, confidence, geometry, and relationships.
        </p>
      </div>
    );
  }

  const handleAskAI = () => {
    setLoadingExplanation(true);
    setAiExplanation(null);
    setTimeout(() => {
      setLoadingExplanation(false);
      setAiExplanation(`Reconstructed ${selectedEntity.properties.name || selectedEntity.id} semantic object. Mesh nodes are positioned at physical coordinates. Perception confidence is ${Math.round(selectedEntity.confidence * 100)}%.`);
    }, 450);
  };

  // Find relationships
  const entityRelationships = currentWorldState.relationships.filter(
    (rel) => rel.source === selectedEntity.id || rel.target === selectedEntity.id
  );

  // Find annotations
  const entityAnnotations = Object.values(currentWorldState.annotations).filter(
    (ann) => ann.entityId === selectedEntity.id
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title Block */}
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--vf-border)', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--vf-text-primary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}>
              {selectedEntity.properties.name || selectedEntity.id}
            </h3>
            <span style={{ fontSize: '10px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)' }}>
              CLASS: {selectedEntity.semanticClass.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              className="btn btn-small"
              onClick={() => setFocusedEntityId(selectedEntity.id)}
              title="Focus Viewport Camera"
              style={{ padding: '4px 8px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}
            >
              FOCUS
            </button>
            <button
              className="btn btn-small"
              onClick={() => setIsolatedEntityId(isolatedEntityId === selectedEntity.id ? null : selectedEntity.id)}
              title="Isolate in Viewport"
              style={{
                padding: '4px 8px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                borderColor: isolatedEntityId === selectedEntity.id ? 'var(--vf-gold)' : undefined,
                color: isolatedEntityId === selectedEntity.id ? 'var(--vf-gold-soft)' : undefined
              }}
            >
              {isolatedEntityId === selectedEntity.id ? 'UNISOLATE' : 'ISOLATE'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '2px' }}>
        
        {/* IDENTITY SECTION */}
        {renderSection('identity', 'Identity specs', (
          <table className="property-table">
            <tbody>
              <tr>
                <th>Type</th>
                <td>{selectedEntity.type}</td>
              </tr>
              <tr>
                <th>Semantic</th>
                <td>{selectedEntity.semanticClass}</td>
              </tr>
              <tr>
                <th>Confidence</th>
                <td>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: selectedEntity.confidence >= 0.9 
                        ? 'var(--vf-text-primary)' 
                        : (selectedEntity.confidence >= 0.7 ? 'var(--vf-gold-soft)' : 'var(--accent-red)')
                    }}
                  >
                    {Math.round(selectedEntity.confidence * 100)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        ))}

        {/* SPATIAL SECTION */}
        {renderSection('spatial', 'Spatial coordinates', (
          <table className="property-table">
            <tbody>
              <tr>
                <th>Position</th>
                <td>
                  [{selectedEntity.transform.position.map((v) => v.toFixed(2)).join(', ')}]
                </td>
              </tr>
              <tr>
                <th>Rotation</th>
                <td>
                  [{selectedEntity.transform.rotation.map((v) => ((v * 180) / Math.PI).toFixed(0)).join('°, ')}°]
                </td>
              </tr>
              <tr>
                <th>Scale</th>
                <td>
                  [{selectedEntity.transform.scale.map((v) => v.toFixed(2)).join(', ')}]
                </td>
              </tr>
            </tbody>
          </table>
        ))}

        {/* GEOMETRY SECTION */}
        {renderSection('geometry', 'Geometry spec', (
          <table className="property-table">
            <tbody>
              <tr>
                <th>Shape Type</th>
                <td>{selectedEntity.geometry.type}</td>
              </tr>
              {selectedEntity.geometry.dimensions &&
                Object.entries(selectedEntity.geometry.dimensions).map(([dim, val]) => (
                  <tr key={dim}>
                    <th>{dim.charAt(0).toUpperCase() + dim.slice(1)}</th>
                    <td>
                      {val} {currentWorldState.metadata.units}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        ))}

        {/* PROPERTIES SECTION */}
        {renderSection('properties', 'Semantic properties', (
          <table className="property-table">
            <tbody>
              {Object.entries(selectedEntity.properties)
                .filter(([k]) => k !== 'name')
                .map(([key, val]) => (
                  <tr key={key}>
                    <th>{key}</th>
                    <td>{String(val)}</td>
                  </tr>
                ))}
              {Object.entries(selectedEntity.properties).filter(([k]) => k !== 'name').length === 0 && (
                <tr>
                  <td colSpan={2} style={{ color: 'var(--vf-text-muted)', fontStyle: 'italic' }}>No properties mapped.</td>
                </tr>
              )}
            </tbody>
          </table>
        ))}

        {/* RELATIONSHIPS SECTION */}
        {renderSection('relationships', 'Linked entities', (
          entityRelationships.length === 0 ? (
            <div className="text-muted" style={{ padding: '6px 4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              No entities mapped in relationship graph.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              {entityRelationships.map((rel) => {
                const isSource = rel.source === selectedEntity.id;
                const otherId = isSource ? rel.target : rel.source;
                const otherEntity = currentWorldState.entities[otherId];
                const otherName = otherEntity?.properties.name || otherId;
                return (
                  <div
                    key={rel.id}
                    onClick={() => selectEntity(otherId)}
                    style={{
                      padding: '8px',
                      background: 'rgba(13, 10, 24, 0.4)',
                      border: '1px solid var(--vf-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      transition: 'border-color 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--vf-border-active)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--vf-border)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--vf-lavender)', fontSize: '9px', fontWeight: 'bold' }}>
                        {rel.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--vf-text-muted)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>{isSource ? 'OUT' : 'IN'}</span>
                    </div>
                    <span style={{ color: 'var(--vf-text-primary)' }}>
                      {isSource ? '→ ' : '← '} {otherName}
                    </span>
                  </div>
                );
              })}
            </div>
          )
        ), entityRelationships.length)}

        {/* ANNOTATIONS SECTION */}
        {renderSection('annotations', 'System anomalies', (
          entityAnnotations.length === 0 ? (
            <div className="text-muted" style={{ padding: '6px 4px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              No anomalies registered on node.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
              {entityAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '8px',
                    background:
                      ann.type === 'warning'
                        ? 'rgba(239, 68, 68, 0.05)'
                        : 'rgba(13, 10, 24, 0.4)',
                    border: `1px solid ${
                      ann.type === 'warning' ? 'rgba(239, 68, 68, 0.3)' : 'var(--vf-border)'
                    }`,
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontFamily: 'var(--font-mono)', fontSize: '9px' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: ann.type === 'warning' ? 'var(--accent-red)' : 'var(--vf-lavender)',
                      }}
                    >
                      {ann.type.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--vf-text-muted)' }}>by {ann.author}</span>
                  </div>
                  <div style={{ color: 'var(--vf-text-primary)' }}>{ann.text}</div>
                </div>
              ))}
            </div>
          )
        ), entityAnnotations.length)}

        {/* AI COGNITIVE DIAGNOSTIC */}
        {renderSection('ai_insight', 'Cognitive diagnostics', (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'rgba(212, 175, 106, 0.05)',
              border: '1px solid var(--vf-gold)',
              borderRadius: '6px',
              boxShadow: '0 0 16px rgba(212, 175, 106, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                <HelpCircle size={14} style={{ color: 'var(--vf-gold)' }} />
                <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'var(--vf-gold-bright)', letterSpacing: '0.5px' }}>✦ AI INSIGHT</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-text-muted)' }}>V_COGNITIVE</span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--vf-gold-bright)', fontFamily: 'var(--font-sans)', lineHeight: '1.5' }}>
              "{getContextualInsight(selectedEntity.id, currentWorldState)}"
            </p>

            <button
              className="btn btn-small"
              onClick={handleAskAI}
              disabled={loadingExplanation}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: 'rgba(212, 175, 106, 0.1)',
                borderColor: 'var(--vf-gold)',
                color: 'var(--vf-gold-bright)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.5px',
                transition: 'all 0.2s',
                cursor: 'pointer',
                padding: '4px 10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--vf-gold)';
                e.currentTarget.style.color = '#05040A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(212, 175, 106, 0.1)';
                e.currentTarget.style.color = 'var(--vf-gold-bright)';
              }}
            >
              {loadingExplanation ? 'ANALYZING BUFFER...' : 'Explain this entity'}
            </button>

            {aiExplanation && (
              <div
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--vf-bright-lavender)',
                  backgroundColor: 'rgba(13, 10, 24, 0.6)',
                  border: '1px solid var(--vf-border)',
                  borderRadius: '4px',
                  padding: '8px',
                  lineHeight: '1.5',
                  marginTop: '4px'
                }}
              >
                {aiExplanation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default Inspector;
