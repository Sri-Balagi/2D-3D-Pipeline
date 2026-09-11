# Inspector.tsx

``tsx
import React, { useState } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { HelpCircle, AlertCircle, Share2, MessageSquare, Info } from 'lucide-react';

export const Inspector: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  
  const worldSource = useWorldStore((state) => state.worldSource);
  const activeModelInfo = useWorldStore((state) => state.activeModelInfo);

  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'n/a';
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  if (!currentWorldState) {
    return (
      <div className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>
        No project active.
      </div>
    );
  }

  // If in Real GLB mode and no node is selected (or root is selected), render the Model Telemetry dashboard directly
  if (worldSource !== 'MOCK' && activeModelInfo && (!selectedEntityId || selectedEntityId === 'asset_root')) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            Model Telemetry
          </h3>
          <span style={{ fontSize: '10px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            SOURCE: {activeModelInfo.source}
          </span>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="section-title">Asset Specification</div>
            <table className="property-table">
              <tbody>
                <tr>
                  <th>Filename</th>
                  <td>{activeModelInfo.filename}</td>
                </tr>
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
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                    {currentWorldState.metadata.domain.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <th>Model Units</th>
                  <td>{currentWorldState.metadata.units}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div className="section-title">Geometry Telemetry</div>
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
                    [{activeModelInfo.boundingBox.min.map((v: number) => v.toFixed(1)).join(', ')}]
                  </td>
                </tr>
                <tr>
                  <th>Bounds Max</th>
                  <td>
                    [{activeModelInfo.boundingBox.max.map((v: number) => v.toFixed(1)).join(', ')}]
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
          </div>

          <div>
            <div className="section-title">Scene Graph Structure</div>
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
          </div>
        </div>
      </div>
    );
  }

  const selectedEntity = selectedEntityId ? currentWorldState.entities[selectedEntityId] : null;

  if (!selectedEntity) {
    return (
      <div className="text-muted" style={{ padding: '20px', textAlign: 'center', fontSize: '12px' }}>
        Select an entity from the World Tree or click it in the 3D viewport to inspect properties.
      </div>
    );
  }

  const handleAskAI = () => {
    setLoadingExplanation(true);
    setAiExplanation(null);
    setTimeout(() => {
      setLoadingExplanation(false);
      setAiExplanation('AI explanation unavailable �?" backend not connected.');
    }, 800);
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
      <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
          {selectedEntity.properties.name || selectedEntity.id}
        </h3>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ID: {selectedEntity.id}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
        {/* Core Metadata */}
        <div>
          <div className="section-title">
            <span>Metadata</span>
            <Info size={12} />
          </div>
          <table className="property-table">
            <tbody>
              <tr>
                <th>Type</th>
                <td>{selectedEntity.type}</td>
              </tr>
              <tr>
                <th>Semantic Class</th>
                <td>{selectedEntity.semanticClass}</td>
              </tr>
              <tr>
                <th>Confidence</th>
                <td>
                  <span
                    className={`confidence-badge ${
                      selectedEntity.confidence >= 0.9
                        ? 'confidence-high'
                        : selectedEntity.confidence >= 0.7
                        ? 'confidence-med'
                        : 'confidence-low'
                    }`}
                  >
                    {Math.round(selectedEntity.confidence * 100)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Spatial Transform */}
        <div>
          <div className="section-title">Spatial Transform</div>
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
        </div>

        {/* Geometry Details */}
        <div>
          <div className="section-title">Geometry Specification</div>
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
        </div>

        {/* Domain Properties */}
        <div>
          <div className="section-title">Properties</div>
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
            </tbody>
          </table>
        </div>

        {/* Relationships */}
        <div>
          <div className="section-title">
            <span>Relationships ({entityRelationships.length})</span>
            <Share2 size={12} />
          </div>
          {entityRelationships.length === 0 ? (
            <div className="text-muted" style={{ padding: '6px', fontSize: '11px' }}>
              No relationships mapped.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
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
                      padding: '6px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-cyan" style={{ fontFamily: 'var(--font-mono)' }}>
                        {rel.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>{isSource ? 'OUT' : 'IN'}</span>
                    </div>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {isSource ? '�?' ' : '�?� '} {otherName}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Local Annotations */}
        <div>
          <div className="section-title">
            <span>Annotations ({entityAnnotations.length})</span>
            <MessageSquare size={12} />
          </div>
          {entityAnnotations.length === 0 ? (
            <div className="text-muted" style={{ padding: '6px', fontSize: '11px' }}>
              No annotations attached.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              {entityAnnotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{
                    padding: '8px',
                    background:
                      ann.type === 'warning'
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'var(--bg-secondary)',
                    border: `1px solid ${
                      ann.type === 'warning' ? 'var(--accent-red)' : 'var(--border-color)'
                    }`,
                    borderRadius: '4px',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: ann.type === 'warning' ? 'var(--accent-red)' : 'var(--accent-cyan)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {ann.type.toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>by {ann.author}</span>
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>{ann.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Explanation panel */}
        <div
          style={{
            marginTop: '10px',
            padding: '12px',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            border: '1px dashed var(--accent-cyan)',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
            <HelpCircle size={14} className="text-cyan" />
            <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>AI Explain</span>
          </div>

          {aiExplanation ? (
            <div
              style={{
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-orange)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertCircle size={14} />
              <span>{aiExplanation}</span>
            </div>
          ) : (
            <button
              className="btn btn-small primary"
              onClick={handleAskAI}
              disabled={loadingExplanation}
              style={{ alignSelf: 'flex-start' }}
            >
              {loadingExplanation ? 'Processing...' : 'Explain This Object'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default Inspector;

``