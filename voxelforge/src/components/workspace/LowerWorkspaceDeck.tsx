import React from 'react';

export const LowerWorkspaceDeck: React.FC = () => {
  return (
    <div
      style={{
        width: 'var(--sidebar-width)',
        alignSelf: 'flex-end',
        marginRight: '8px',
        marginBottom: '8px',
        background: 'rgba(13, 10, 24, 0.85)',
        border: '1px solid rgba(196, 181, 253, 0.16)',
        borderRadius: '6px',
        padding: '8px 12px',
        backdropFilter: 'blur(16px)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--vf-text-primary)', letterSpacing: '0.5px' }}>
          EVENT LOG
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-gold-bright)' }}>
          ✦ SPATIAL TELEMETRY
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '68px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--vf-gold-soft)' }}>✦ Spatial target acquired</span>
          <span style={{ color: 'var(--vf-text-muted)', fontSize: '8px' }}>10:24:12</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--vf-lavender)' }}>• Perception confidence verified: 92%</span>
          <span style={{ color: 'var(--vf-text-muted)', fontSize: '8px' }}>10:24:08</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--vf-text-secondary)' }}>• Topological graph mapped</span>
          <span style={{ color: 'var(--vf-text-muted)', fontSize: '8px' }}>10:24:01</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: 'var(--vf-text-muted)' }}>• Viewport camera focus engaged</span>
          <span style={{ color: 'var(--vf-text-muted)', fontSize: '8px' }}>10:23:55</span>
        </div>
      </div>
    </div>
  );
};

export default LowerWorkspaceDeck;
