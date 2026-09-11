import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { Layers, Columns, Terminal, Split } from 'lucide-react';

export const Header: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    setLeftSidebarVisible,
    setRightSidebarVisible,
    commandPaletteOpen,
    setCommandPaletteOpen,
    splitViewActive,
    setSplitViewActive
  } = useUIStore();

  const domainName = currentWorldState?.metadata.domain
    ? currentWorldState.metadata.domain.toUpperCase()
    : 'ANATOMICAL';

  const projectName = currentWorldState?.metadata.name
    ? currentWorldState.metadata.name
    : 'Awaiting Intake';

  return (
    <header className="top-nav">
      {/* Brand & Geometric Isometric Voxel Logo */}
      <div className="brand">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outermost Wireframe Isocube */}
          <path d="M12 2L3 7L12 12V22L21 17V7L12 2Z" stroke="#7C3AED" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Top Panel - Semi-translucent Lavender */}
          <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="#C4B5FD" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.0" />
          {/* Right Bottom Accent Panel - Shaded Gold */}
          <path d="M12 12L21 17L12 22V12Z" fill="#D4AF6A" fillOpacity="0.2" stroke="#E7C982" strokeWidth="1.0" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <span className="brand-text">VOXEL FORGE</span>
          <span className="brand-subtitle">SPATIAL CORE v2.0.0</span>
        </div>
      </div>

      {/* Central Technical Telemetry */}
      <div className="project-meta">
        <div className="meta-info">
          <span className="meta-category">PROJECT</span>
          <span className="meta-title">{projectName}</span>
        </div>
        <div className="meta-divider"></div>
        <div className="meta-info">
          <span className="meta-category">DOMAIN</span>
          <span className="meta-title accent-violet">{domainName}</span>
        </div>
        <div className="meta-divider"></div>
        <div className="meta-info">
          <span className="meta-category">WORLD STATE</span>
          <span className={`meta-title ${currentWorldState ? 'status-active' : 'status-awaiting'}`}>
            {currentWorldState ? 'ACTIVE' : 'AWAITING_INPUT'}
          </span>
        </div>
      </div>

      {/* Controls & AI Operating status */}
      <div className="flex-row" style={{ gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot-gold"></span>
            <span style={{ color: 'var(--vf-text-muted)' }}>AI_INTEL:</span>
            <span style={{ color: 'var(--vf-gold-soft)' }}>READY</span>
          </div>
          <div style={{ width: '1px', height: '10px', backgroundColor: 'var(--vf-border)' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot-violet"></span>
            <span style={{ color: 'var(--vf-text-muted)' }}>CORE:</span>
            <span style={{ color: 'var(--vf-lavender)' }}>ONLINE</span>
          </div>
        </div>

        <div className="flex-row" style={{ gap: '6px' }}>
          <button
            className={`btn btn-small btn-header ${commandPaletteOpen ? 'active' : ''}`}
            onClick={() => setCommandPaletteOpen(!commandPaletteOpen)}
            title="Toggle Command Bar (Esc)"
          >
            <Terminal size={12} />
            <span>CONSOLE</span>
          </button>
          
          <button
            className={`btn btn-small btn-header ${splitViewActive ? 'active' : ''}`}
            onClick={() => setSplitViewActive(!splitViewActive)}
            title="Toggle 2D/3D Split Screen View"
            disabled={!currentWorldState}
            style={{ opacity: currentWorldState ? 1 : 0.4 }}
          >
            <Split size={12} />
            <span style={{ fontSize: '9px', marginLeft: '3px' }}>SPLIT</span>
          </button>
          
          <button
            className={`btn btn-small btn-header ${leftSidebarVisible ? 'active' : ''}`}
            onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
            title="Toggle Left Explorer"
          >
            <Layers size={12} />
          </button>

          <button
            className={`btn btn-small btn-header ${rightSidebarVisible ? 'active' : ''}`}
            onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
            title="Toggle Inspector"
          >
            <Columns size={12} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
