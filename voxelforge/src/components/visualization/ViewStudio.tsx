import React, { useState } from 'react';
import { useUIStore } from '../../state/useUIStore';
import type { VisualizationMode } from '../../state/useUIStore';
import { 
  Eye, 
  ShieldCheck, 
  Grid, 
  Layers, 
  Activity, 
  Scissors, 
  Compass, 
  MessageSquare, 
  Sliders, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';

export const ViewStudio: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSpatialSubpanel, setActiveSpatialSubpanel] = useState<'NONE' | 'EXPLODE' | 'CLIP'>('NONE');

  const {
    visualizationMode,
    setVisualizationMode,
    explosionFactor,
    setExplosionFactor,
    clipXActive,
    clipYActive,
    clipZActive,
    toggleClipX,
    toggleClipY,
    toggleClipZ,
    measurementMode,
    setMeasurementMode,
    clearMeasurementPoints,
    annotationModeActive,
    setAnnotationModeActive,
  } = useUIStore();

  const viewModes: { id: VisualizationMode; label: string; icon: any }[] = [
    { id: 'solid', label: 'Solid', icon: Eye },
    { id: 'holo', label: 'Holo', icon: Activity },
    { id: 'semantic', label: 'Semantic', icon: Layers },
    { id: 'x-ray', label: 'X-Ray', icon: Scissors },
    { id: 'wireframe', label: 'Wire', icon: Grid },
    { id: 'ghost', label: 'Ghost', icon: Eye },
    { id: 'confidence', label: 'Confidence', icon: ShieldCheck }
  ];

  return (
    <div
      className="spatial-tool-rail"
      style={{
        position: 'relative',
        width: isCollapsed ? '44px' : '135px',
        background: 'rgba(10, 7, 20, 0.88)',
        border: '1px solid rgba(167, 139, 250, 0.28)',
        borderRadius: '8px',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 36px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px 6px',
        transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Header & Rail Collapse Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          paddingBottom: '4px',
          borderBottom: '1px solid rgba(196, 181, 253, 0.14)',
          marginBottom: '2px'
        }}
      >
        {!isCollapsed && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, color: 'var(--vf-gold-soft)', letterSpacing: '1px' }}>
            SPATIAL RAIL
          </span>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Spatial Rail' : 'Collapse Spatial Rail'}
          style={{
            background: 'rgba(21, 16, 37, 0.8)',
            border: '1px solid var(--vf-border)',
            borderRadius: '3px',
            color: 'var(--vf-lavender)',
            cursor: 'pointer',
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isCollapsed ? <ChevronLeft size={11} /> : <ChevronRight size={11} />}
        </button>
      </div>

      {/* SECTION A: VIEW MODES */}
      {!isCollapsed && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-text-muted)', letterSpacing: '0.5px', marginTop: '2px' }}>
          VIEW
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {viewModes.map((m) => {
          const Icon = m.icon;
          const isActive = visualizationMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setVisualizationMode(m.id)}
              title={`${m.label} Mode`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '6px',
                padding: isCollapsed ? '6px 0' : '5px 8px',
                background: isActive ? 'rgba(124, 58, 237, 0.25)' : 'rgba(21, 16, 37, 0.4)',
                border: `1px solid ${isActive ? 'var(--vf-violet)' : 'rgba(196, 181, 253, 0.1)'}`,
                borderRadius: '4px',
                color: isActive ? 'var(--vf-bright-lavender)' : 'var(--vf-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 12px rgba(124, 58, 237, 0.35)' : undefined,
                transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={12} style={{ color: isActive ? 'var(--vf-bright-lavender)' : 'var(--vf-soft-violet)', flexShrink: 0 }} />
              {!isCollapsed && <span style={{ fontWeight: isActive ? 600 : 400 }}>{m.label.toUpperCase()}</span>}
            </button>
          );
        })}
      </div>

      {/* Subtle Separator */}
      <div style={{ height: '1px', background: 'rgba(196, 181, 253, 0.18)', margin: '4px 0' }} />

      {/* SECTION B: SPATIAL TOOLS */}
      {!isCollapsed && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-text-muted)', letterSpacing: '0.5px' }}>
          SPATIAL
        </span>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {/* Explode */}
        <button
          onClick={() => {
            if (activeSpatialSubpanel === 'EXPLODE') {
              setActiveSpatialSubpanel('NONE');
            } else {
              setActiveSpatialSubpanel('EXPLODE');
            }
          }}
          title="Exploded Assembly View"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '6px',
            padding: isCollapsed ? '6px 0' : '5px 8px',
            background: explosionFactor > 0 || activeSpatialSubpanel === 'EXPLODE' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(21, 16, 37, 0.4)',
            border: `1px solid ${explosionFactor > 0 || activeSpatialSubpanel === 'EXPLODE' ? 'var(--vf-violet)' : 'rgba(196, 181, 253, 0.1)'}`,
            borderRadius: '4px',
            color: explosionFactor > 0 ? 'var(--vf-bright-lavender)' : 'var(--vf-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            whiteSpace: 'nowrap'
          }}
        >
          <Sliders size={12} style={{ color: explosionFactor > 0 ? 'var(--vf-bright-lavender)' : 'var(--vf-soft-violet)', flexShrink: 0 }} />
          {!isCollapsed && <span>EXPLODE</span>}
        </button>

        {/* Explode Subpanel Slider */}
        {activeSpatialSubpanel === 'EXPLODE' && !isCollapsed && (
          <div style={{ background: 'rgba(5, 4, 10, 0.8)', padding: '6px', borderRadius: '4px', border: '1px solid var(--vf-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)' }}>
              <span>FACTOR</span>
              <span style={{ color: 'var(--vf-gold-bright)' }}>{explosionFactor.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.05"
              value={explosionFactor}
              onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
              className="vf-slider"
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>
        )}

        {/* Clip */}
        <button
          onClick={() => {
            if (activeSpatialSubpanel === 'CLIP') {
              setActiveSpatialSubpanel('NONE');
            } else {
              setActiveSpatialSubpanel('CLIP');
            }
          }}
          title="Section Clipping Planes"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '6px',
            padding: isCollapsed ? '6px 0' : '5px 8px',
            background: clipXActive || clipYActive || clipZActive || activeSpatialSubpanel === 'CLIP' ? 'rgba(124, 58, 237, 0.25)' : 'rgba(21, 16, 37, 0.4)',
            border: `1px solid ${clipXActive || clipYActive || clipZActive || activeSpatialSubpanel === 'CLIP' ? 'var(--vf-violet)' : 'rgba(196, 181, 253, 0.1)'}`,
            borderRadius: '4px',
            color: 'var(--vf-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            whiteSpace: 'nowrap'
          }}
        >
          <Scissors size={12} style={{ color: 'var(--vf-soft-violet)', flexShrink: 0 }} />
          {!isCollapsed && <span>CLIP</span>}
        </button>

        {/* Clip Subpanel */}
        {activeSpatialSubpanel === 'CLIP' && !isCollapsed && (
          <div style={{ background: 'rgba(5, 4, 10, 0.8)', padding: '6px', borderRadius: '4px', border: '1px solid var(--vf-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className={`clip-toggle-btn ${clipXActive ? 'active' : ''}`} onClick={() => toggleClipX()}>X</button>
              <button className={`clip-toggle-btn ${clipYActive ? 'active' : ''}`} onClick={() => toggleClipY()}>Y</button>
              <button className={`clip-toggle-btn ${clipZActive ? 'active' : ''}`} onClick={() => toggleClipZ()}>Z</button>
            </div>
          </div>
        )}

        {/* Measure */}
        <button
          onClick={() => {
            const nextMode = !measurementMode;
            setMeasurementMode(nextMode);
            if (!nextMode) clearMeasurementPoints();
          }}
          title="3D Euclidean Surface Raycast Measurement"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '6px',
            padding: isCollapsed ? '6px 0' : '5px 8px',
            background: measurementMode ? 'rgba(212, 175, 106, 0.2)' : 'rgba(21, 16, 37, 0.4)',
            border: `1px solid ${measurementMode ? 'var(--vf-gold)' : 'rgba(196, 181, 253, 0.1)'}`,
            borderRadius: '4px',
            color: measurementMode ? 'var(--vf-gold-bright)' : 'var(--vf-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            cursor: 'pointer',
            boxShadow: measurementMode ? '0 0 12px rgba(212, 175, 106, 0.35)' : undefined,
            transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            whiteSpace: 'nowrap'
          }}
        >
          <Compass size={12} style={{ color: measurementMode ? 'var(--vf-gold-bright)' : 'var(--vf-gold-soft)', flexShrink: 0 }} />
          {!isCollapsed && <span>MEASURE</span>}
        </button>

        {/* Annotate */}
        <button
          onClick={() => setAnnotationModeActive(!annotationModeActive)}
          title="3D Spatial Annotations"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: '6px',
            padding: isCollapsed ? '6px 0' : '5px 8px',
            background: annotationModeActive ? 'rgba(124, 58, 237, 0.25)' : 'rgba(21, 16, 37, 0.4)',
            border: `1px solid ${annotationModeActive ? 'var(--vf-violet)' : 'rgba(196, 181, 253, 0.1)'}`,
            borderRadius: '4px',
            color: annotationModeActive ? 'var(--vf-bright-lavender)' : 'var(--vf-text-secondary)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            whiteSpace: 'nowrap'
          }}
        >
          <MessageSquare size={12} style={{ color: annotationModeActive ? 'var(--vf-bright-lavender)' : 'var(--vf-soft-violet)', flexShrink: 0 }} />
          {!isCollapsed && <span>ANNOTATE</span>}
        </button>
      </div>
    </div>
  );
};

export default ViewStudio;
