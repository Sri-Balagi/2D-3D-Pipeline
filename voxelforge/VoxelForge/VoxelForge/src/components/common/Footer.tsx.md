# Footer.tsx

``tsx
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
      <div className="footer-section">
        <span>UNITS: <span style={{ color: 'var(--text-primary)' }}>{units} (scale: {scale}m)</span></span>
        <span>|</span>
        <span>ENTITIES: <span style={{ color: 'var(--text-primary)' }}>{entityCount}</span></span>
        <span>|</span>
        <span>RELATIONSHIPS: <span style={{ color: 'var(--text-primary)' }}>{relationshipCount}</span></span>
      </div>

      <div className="footer-section">
        <span>VIEWPORT: <span style={{ color: 'var(--accent-cyan)' }}>{visualizationMode.toUpperCase()}</span></span>
        <span>|</span>
        <span>CAMERA: <span style={{ color: 'var(--text-primary)' }}>{cameraMode.toUpperCase()}</span></span>
      </div>

      <div className="footer-section">
        <span>[R] RESET CAM</span>
        <span>[Space] SIM PLAY/PAUSE</span>
        <span>[Esc] CLOSE PALETTE</span>
      </div>
    </footer>
  );
};
export default Footer;

``