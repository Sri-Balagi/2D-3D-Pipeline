import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export const PipelineStatusBar: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);

  if (!currentWorldState) return null;

  const steps = [
    { label: 'UPLOAD', status: 'completed' },
    { label: 'ANALYZE', status: 'active' },
    { label: 'DETECT', status: 'pending' },
    { label: 'UNDERSTAND', status: 'pending' },
    { label: 'RECONSTRUCT', status: 'pending' },
    { label: 'VALIDATE', status: 'pending' },
    { label: 'COMPLETE', status: 'pending' },
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        background: 'rgba(13, 10, 24, 0.85)',
        border: '1px solid rgba(196, 181, 253, 0.18)',
        borderRadius: '8px',
        padding: '8px 18px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        maxWidth: '92vw'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 600, color: 'var(--vf-lavender)', letterSpacing: '0.5px' }}>
          PIPELINE STATUS (DEMO MODE)
        </span>
      </div>

      {/* Nodes progress bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <React.Fragment key={step.label}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div
                  style={{
                    width: isActive ? '9px' : '7px',
                    height: isActive ? '9px' : '7px',
                    borderRadius: '50%',
                    background: isActive ? 'var(--vf-violet)' : (isCompleted ? 'var(--vf-lavender)' : 'rgba(111, 106, 124, 0.4)'),
                    boxShadow: isActive ? '0 0 10px var(--vf-violet)' : (isCompleted ? '0 0 4px var(--vf-lavender)' : 'none'),
                    border: isActive ? '1px solid var(--vf-bright-lavender)' : 'none'
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '8px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--vf-bright-lavender)' : (isCompleted ? 'var(--vf-text-primary)' : 'var(--vf-text-muted)'),
                    letterSpacing: '0.5px'
                  }}
                >
                  {isActive ? `{ ${step.label} }` : step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '16px',
                    height: '1px',
                    background: isCompleted ? 'var(--vf-lavender)' : 'rgba(111, 106, 124, 0.3)'
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--vf-text-muted)', letterSpacing: '0.3px' }}>
        Analyzing spatial structure...
      </span>
    </div>
  );
};

export default PipelineStatusBar;
