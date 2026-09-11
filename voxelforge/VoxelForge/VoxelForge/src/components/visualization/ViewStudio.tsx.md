# ViewStudio.tsx

``tsx
import React from 'react';
import { useUIStore } from '../../state/useUIStore';
import type { VisualizationMode } from '../../state/useUIStore';
import { Eye, ShieldCheck, Grid, Layers, Activity, Scissors, Compass } from 'lucide-react';

export const ViewStudio: React.FC = () => {
  const {
    visualizationMode,
    setVisualizationMode,
    explosionFactor,
    setExplosionFactor,
    clipX,
    clipY,
    clipZ,
    clipXActive,
    clipYActive,
    clipZActive,
    setClipX,
    setClipY,
    setClipZ,
    toggleClipX,
    toggleClipY,
    toggleClipZ,
    measurementMode,
    setMeasurementMode,
    clearMeasurementPoints
  } = useUIStore();

  const modes: { id: VisualizationMode; label: string; icon: any }[] = [
    { id: 'solid', label: 'Solid', icon: Eye },
    { id: 'holo', label: 'Holo', icon: Activity },
    { id: 'semantic', label: 'Semantic', icon: Layers },
    { id: 'x-ray', label: 'X-Ray', icon: Scissors },
    { id: 'wireframe', label: 'Wireframe', icon: Grid },
    { id: 'ghost', label: 'Ghost', icon: Eye },
    { id: 'confidence', label: 'Confidence', icon: ShieldCheck }
  ];

  return (
    <div className="view-studio">
      {/* Visual Modes Group */}
      <div className="studio-group">
        {modes.map((m) => {
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              className={`studio-btn ${visualizationMode === m.id ? 'active' : ''}`}
              onClick={() => setVisualizationMode(m.id)}
              title={`${m.label} View`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon size={12} />
                <span>{m.label.toUpperCase()}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Exploded View Slider Group */}
      <div className="studio-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>EXPLODE:</span>
        <input
          type="range"
          min="0"
          max="2.5"
          step="0.05"
          value={explosionFactor}
          onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
          style={{ width: '80px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
        />
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', width: '24px' }}>
          {explosionFactor.toFixed(1)}
        </span>
      </div>

      {/* Clipping Section Group */}
      <div className="studio-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>CLIPPING:</span>
        
        {/* X Clip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="checkbox"
            checked={clipXActive}
            onChange={() => toggleClipX()}
            style={{ accentColor: 'var(--accent-cyan)' }}
          />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>X</span>
          {clipXActive && (
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={clipX}
              onChange={(e) => setClipX(parseInt(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--accent-cyan)' }}
            />
          )}
        </div>

        {/* Y Clip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="checkbox"
            checked={clipYActive}
            onChange={() => toggleClipY()}
            style={{ accentColor: 'var(--accent-cyan)' }}
          />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>Y</span>
          {clipYActive && (
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={clipY}
              onChange={(e) => setClipY(parseInt(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--accent-cyan)' }}
            />
          )}
        </div>

        {/* Z Clip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <input
            type="checkbox"
            checked={clipZActive}
            onChange={() => toggleClipZ()}
            style={{ accentColor: 'var(--accent-cyan)' }}
          />
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>Z</span>
          {clipZActive && (
            <input
              type="range"
              min="-100"
              max="100"
              step="1"
              value={clipZ}
              onChange={(e) => setClipZ(parseInt(e.target.value))}
              style={{ width: '50px', accentColor: 'var(--accent-cyan)' }}
            />
          )}
        </div>
      </div>

      {/* Measurement Tool */}
      <div className="studio-group">
        <button
          className={`studio-btn ${measurementMode ? 'active' : ''}`}
          onClick={() => {
            const nextMode = !measurementMode;
            setMeasurementMode(nextMode);
            if (!nextMode) clearMeasurementPoints();
          }}
          title="Distance Measurement Tool"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Compass size={12} />
            <span>MEASURE</span>
          </div>
        </button>
      </div>
    </div>
  );
};
export default ViewStudio;

``