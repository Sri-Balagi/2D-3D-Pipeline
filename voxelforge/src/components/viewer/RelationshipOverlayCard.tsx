import React from 'react';
import { useUIStore } from '../../state/useUIStore';

export const RelationshipOverlayCard: React.FC = () => {
  const showRelationships = useUIStore((state) => state.showRelationships);
  const setShowRelationships = useUIStore((state) => state.setShowRelationships);

  return (
    <div
      className="relationship-overlay-card"
      style={{
        position: 'relative',
        background: 'rgba(13, 10, 24, 0.88)',
        border: '1px solid rgba(196, 181, 253, 0.18)',
        borderRadius: '6px',
        padding: '6px 12px',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'var(--font-mono)',
        fontSize: '9px'
      }}
    >
      <span style={{ color: 'var(--vf-text-muted)', fontWeight: 600 }}>RELATIONSHIPS</span>

      {/* Switch toggle */}
      <button
        onClick={() => setShowRelationships(!showRelationships)}
        style={{
          background: showRelationships ? 'rgba(124, 58, 237, 0.25)' : 'rgba(13, 10, 24, 0.6)',
          border: `1px solid ${showRelationships ? 'var(--vf-violet)' : 'var(--vf-border)'}`,
          color: showRelationships ? 'var(--vf-lavender)' : 'var(--vf-text-muted)',
          borderRadius: '10px',
          padding: '2px 8px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          fontWeight: 700
        }}
      >
        {showRelationships ? 'ON' : 'OFF'}
      </button>

      {showRelationships && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(212, 175, 106, 0.1)', border: '1px solid var(--vf-gold)', borderRadius: '3px', padding: '2px 6px', color: 'var(--vf-gold-bright)' }}>
          <span>➜ connected_to</span>
          <span style={{ fontWeight: 'bold' }}>82%</span>
        </div>
      )}
    </div>
  );
};

export default RelationshipOverlayCard;
