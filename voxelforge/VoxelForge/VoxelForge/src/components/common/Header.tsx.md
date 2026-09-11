# Header.tsx

``tsx
import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { Cpu, Layers, Columns, Terminal } from 'lucide-react';

export const Header: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    setLeftSidebarVisible,
    setRightSidebarVisible,
    commandPaletteOpen,
    setCommandPaletteOpen
  } = useUIStore();

  const domainName = currentWorldState?.metadata.domain
    ? currentWorldState.metadata.domain.toUpperCase()
    : 'NO DOMAIN';

  const projectName = currentWorldState?.metadata.name
    ? currentWorldState.metadata.name
    : 'Uninitialized Workspace';

  return (
    <header className="top-nav">
      <div className="brand">
        <Cpu size={18} />
        <span>VOXEL FORGE // v1.0.0</span>
      </div>

      <div className="project-meta">
        <div className="meta-item">
          <span className="meta-label">PROJECT:</span>
          <span className="meta-value">{projectName}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">DOMAIN:</span>
          <span className="meta-value" style={{ color: 'var(--accent-cyan)' }}>
            {domainName}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">STATUS:</span>
          <span
            className="meta-value"
            style={{ color: currentWorldState ? 'var(--accent-green)' : 'var(--accent-orange)' }}
          >
            {currentWorldState ? 'ACTIVE_WORLD' : 'AWAITING_INPUT'}
          </span>
        </div>
      </div>

      <div className="flex-row">
        <button
          className={`btn btn-small ${commandPaletteOpen ? 'primary' : ''}`}
          onClick={() => setCommandPaletteOpen(!commandPaletteOpen)}
          title="Toggle Command Bar (Esc)"
        >
          <Terminal size={14} />
          <span>Console</span>
        </button>

        <button
          className={`btn btn-small ${leftSidebarVisible ? 'primary' : ''}`}
          onClick={() => setLeftSidebarVisible(!leftSidebarVisible)}
          title="Toggle Left Explorer"
        >
          <Layers size={14} />
        </button>

        <button
          className={`btn btn-small ${rightSidebarVisible ? 'primary' : ''}`}
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          title="Toggle Inspector"
        >
          <Columns size={14} />
        </button>
      </div>
    </header>
  );
};
export default Header;

``