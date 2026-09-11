# App.tsx

``tsx
import React from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WorldTree from './components/world/WorldTree';
import Inspector from './components/inspector/Inspector';
import UploadPanel from './components/upload/UploadPanel';
import SimulationPanel from './components/simulation/SimulationPanel';
import Viewport from './components/viewer/Viewport';
import ViewStudio from './components/visualization/ViewStudio';
import CommandBar from './components/ai/CommandBar';

import { useWorldStore } from './state/useWorldStore';
import { useUIStore } from './state/useUIStore';
import { Compass, Cpu } from 'lucide-react';

export const App: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  
  const {
    leftSidebarVisible,
    rightSidebarVisible,
    activePanel,
    setActivePanel
  } = useUIStore();

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header />

      {/* Main Spatial Workspace */}
      <main className="workspace">
        {/* Left Sidebar (World Explorer and Simulation Studio) */}
        <aside className={`sidebar ${leftSidebarVisible ? '' : 'collapsed'}`}>
          <div className="tabs-header">
            <button
              className={`tab-btn ${activePanel === 'upload' ? 'active' : ''}`}
              onClick={() => setActivePanel('upload')}
            >
              UPLOADS
            </button>
            <button
              className={`tab-btn ${activePanel === 'tree' ? 'active' : ''}`}
              disabled={!currentWorldState}
              onClick={() => setActivePanel('tree')}
              style={{ opacity: currentWorldState ? 1 : 0.4 }}
            >
              EXPLORER
            </button>
            <button
              className={`tab-btn ${activePanel === 'simulation' ? 'active' : ''}`}
              disabled={!currentWorldState}
              onClick={() => setActivePanel('simulation')}
              style={{ opacity: currentWorldState ? 1 : 0.4 }}
            >
              SIMULATION
            </button>
          </div>

          <div className="panel-content">
            {activePanel === 'upload' && <UploadPanel />}
            {activePanel === 'tree' && <WorldTree />}
            {activePanel === 'simulation' && <SimulationPanel />}
          </div>
        </aside>

        {/* Center 3D Viewport View */}
        <section className="viewport-container">
          {currentWorldState ? (
            <>
              {/* Floating Command Bar Overlay */}
              <CommandBar />

              {/* R3F WebGL Viewport */}
              <Viewport />

              {/* View Studio Selector Overlay */}
              <ViewStudio />
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                textAlign: 'center',
                background: 'radial-gradient(circle, var(--bg-hover) 0%, var(--bg-primary) 100%)',
              }}
            >
              <div
                style={{
                  maxWidth: '520px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <Cpu size={40} style={{ color: 'var(--accent-cyan)' }} />
                <h2 style={{ fontFamily: 'var(--font-mono)', fontWeight: 'normal', color: 'var(--accent-cyan)' }}>
                  AWAITING SPATIAL INPUT
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6' }}>
                  Voxel Forge processes 2D floor blueprints, biological tissue mappings, and mechanical CAD layouts, reconstructing them into a domain-agnostic semantic 3D database.
                </p>
                <div
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'var(--bg-panel)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '6px',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--accent-cyan)',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    HOW TO START:
                  </span>
                  <ul
                    style={{
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      paddingLeft: '16px',
                      lineHeight: '1.8',
                    }}
                  >
                    <li>Use the <strong>Uploads Panel</strong> on the left.</li>
                    <li>Drag a blueprint or click a preset (e.g. Heart MRI, Architecture floorplan).</li>
                    <li>Click <strong>Process & Reconstruct</strong> to construct the spatial world.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Right Sidebar (Properties Inspector) */}
        <aside className={`sidebar right ${rightSidebarVisible ? '' : 'collapsed'}`}>
          <div className="panel-header">
            <span>Inspector</span>
            <Compass size={14} />
          </div>
          <div className="panel-content">
            <Inspector />
          </div>
        </aside>
      </main>

      {/* Footer Status Indicators */}
      <Footer />
    </div>
  );
};

export default App;

``