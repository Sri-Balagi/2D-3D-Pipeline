import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';

export const Footer: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const { cameraMode, visualizationMode } = useUIStore();

  const units = currentWorldState?.metadata.units ?? 'n/a';
  const scale = currentWorldState?.metadata.scale ?? 1.0;
  const entityCount = currentWorldState ? Object.keys(currentWorldState.entities).length : 0;
  const relationshipCount = currentWorldState ? currentWorldState.relationships.length : 0;

  return (
    <footer className="footer">
      {/* Metrics Section */}
      <div className="footer-section">
        <span><span style={{ color: 'var(--vf-text-muted)' }}>UNITS:</span> <span style={{ color: 'var(--vf-text-primary)' }}>{units.toUpperCase()} (SCALE: {scale}M)</span></span>
        <span style={{ color: 'var(--vf-border)' }}>|</span>
        <span><span style={{ color: 'var(--vf-text-muted)' }}>ENTITIES:</span> <span style={{ color: 'var(--vf-text-primary)' }}>{entityCount}</span></span>
        <span style={{ color: 'var(--vf-border)' }}>|</span>
        <span><span style={{ color: 'var(--vf-text-muted)' }}>RELATIONSHIPS:</span> <span style={{ color: 'var(--vf-text-primary)' }}>{relationshipCount}</span></span>
      </div>

      {/* Rendering State Section */}
      <div className="footer-section">
        <span><span style={{ color: 'var(--vf-text-muted)' }}>VIEWPORT:</span> <span style={{ color: 'var(--vf-lavender)', fontWeight: 600, textShadow: '0 0 6px rgba(196,181,253,0.3)' }}>{visualizationMode.toUpperCase()}</span></span>
        <span style={{ color: 'var(--vf-border)' }}>|</span>
        <span><span style={{ color: 'var(--vf-text-muted)' }}>CAMERA:</span> <span style={{ color: 'var(--vf-gold-soft)', fontWeight: 600, textShadow: '0 0 6px rgba(212,175,106,0.3)' }}>{cameraMode.toUpperCase()}</span></span>
      </div>

      {/* Legend / Keybindings Section */}
      <div className="footer-section" style={{ color: 'var(--vf-text-muted)', fontSize: '10px' }}>
        <span>[R] RESET_CAM</span>
        <span>[Space] PLAY/PAUSE</span>
        <span>[Esc] CONSOLE</span>
      </div>
    </footer>
  );
};

export default Footer;
