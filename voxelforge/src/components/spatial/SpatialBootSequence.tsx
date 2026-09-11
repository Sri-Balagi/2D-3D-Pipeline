import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../state/useUIStore';

export const SpatialBootSequence: React.FC = () => {
  const spatialBootState = useUIStore((state) => state.spatialBootState);
  const setSpatialBootState = useUIStore((state) => state.setSpatialBootState);

  const [bootStep, setBootStep] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  const bootLogs = [
    { text: 'CORE SYSTEM ........ ONLINE', color: 'var(--vf-lavender)' },
    { text: 'SPATIAL ENGINE ..... ONLINE', color: 'var(--vf-lavender)' },
    { text: 'WORLD GRAPH ........ READY', color: 'var(--vf-gold-soft)' },
    { text: 'VISUAL ENGINE ...... ONLINE', color: 'var(--vf-lavender)' },
    { text: 'AI INTERFACE ....... READY', color: 'var(--vf-bright-lavender)' },
    { text: 'SPATIAL WORLD INITIALIZED', color: 'var(--vf-gold)' },
  ];

  useEffect(() => {
    if (spatialBootState !== 'BOOTING') return;

    const interval = setInterval(() => {
      setBootStep((prev) => {
        if (prev < bootLogs.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => setFadeOut(true), 600);
          setTimeout(() => setSpatialBootState('READY'), 1000);
          return prev;
        }
      });
    }, 400);

    return () => clearInterval(interval);
  }, [spatialBootState, setSpatialBootState, bootLogs.length]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(() => setSpatialBootState('READY'), 300);
  };

  useEffect(() => {
    const handleKeyDown = () => handleSkip();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (spatialBootState === 'READY') return null;

  return (
    <div
      onClick={handleSkip}
      title="Click or press any key to skip intro"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#07060D',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        pointerEvents: fadeOut ? 'none' : 'auto',
        cursor: 'pointer'
      }}
    >
      {/* Animated Voxel Core Spatial Geometry */}
      <div style={{ position: 'relative', width: '96px', height: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Pulsing Spatial Scan Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)',
            animation: 'spin 4s linear infinite'
          }}
        />

        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            borderRadius: '50%',
            border: '1px dashed rgba(212, 175, 106, 0.3)',
            animation: 'spin 8s linear infinite reverse'
          }}
        />

        {/* Isometric Wireframe Cube SVG */}
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L3 7L12 12V22L21 17V7L12 2Z" stroke="#7C3AED" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#C4B5FD" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.0" />
          <path d="M12 12L21 17L12 22V12Z" fill="#D4AF6A" fillOpacity="0.2" stroke="#E7C982" strokeWidth="1.0" />
        </svg>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: 'var(--vf-bright-lavender)',
            textTransform: 'uppercase'
          }}
        >
          VOXEL FORGE
        </h1>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '1px',
            color: 'var(--vf-gold-soft)'
          }}
        >
          SPATIAL INTELLIGENCE CORE v2.0
        </span>
      </div>

      {/* Boot Logs Terminal */}
      <div
        style={{
          width: '320px',
          background: 'rgba(13, 10, 24, 0.85)',
          border: '1px solid rgba(196, 181, 253, 0.18)',
          borderRadius: '6px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)'
        }}
      >
        {bootLogs.slice(0, bootStep + 1).map((log, index) => (
          <div
            key={index}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              color: log.color,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              animation: 'fadeIn 200ms ease-out'
            }}
          >
            <span style={{ fontSize: '8px', opacity: 0.7 }}>✦</span>
            <span>{log.text}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleSkip}
        style={{
          background: 'rgba(21, 16, 37, 0.8)',
          border: '1px solid var(--vf-border)',
          borderRadius: '4px',
          color: 'var(--vf-text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          padding: '4px 12px',
          cursor: 'pointer',
          marginTop: '8px',
          letterSpacing: '0.5px'
        }}
      >
        CLICK OR PRESS ANY KEY TO SKIP INTRO ➔
      </button>
    </div>
  );
};

export default SpatialBootSequence;
