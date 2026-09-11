import React from 'react';
import { useUIStore } from '../../state/useUIStore';

export const WarningCardsOverlay: React.FC = () => {
  const lowConfidenceFilterActive = useUIStore((state) => state.lowConfidenceFilterActive);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 25,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        pointerEvents: 'auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          background: 'rgba(212, 175, 106, 0.08)',
          border: '1px solid rgba(212, 175, 106, 0.35)',
          borderRadius: '6px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--vf-gold-bright)',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '10px' }}>⚠️</span>
        <span style={{ fontWeight: 600 }}>Height clearance warning</span>
      </div>

      {(lowConfidenceFilterActive || true) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '6px',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--vf-red)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '10px' }}>⚠️</span>
          <span style={{ fontWeight: 600 }}>Low confidence detected</span>
        </div>
      )}
    </div>
  );
};

export default WarningCardsOverlay;
