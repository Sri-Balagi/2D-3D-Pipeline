import React from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import WorldTree from './components/world/WorldTree';
import Inspector from './components/inspector/Inspector';
import UploadPanel from './components/upload/UploadPanel';
import SimulationPanel from './components/simulation/SimulationPanel';
import Viewport from './components/viewer/Viewport';
import CommandBar from './components/ai/CommandBar';
import TwoDViewer from './components/viewer/TwoDViewer';

import { useWorldStore } from './state/useWorldStore';
import { useUIStore } from './state/useUIStore';
import { Compass } from 'lucide-react';

import ViewportHUDLayer from './components/viewer/ViewportHUDLayer';
import LowerWorkspaceDeck from './components/workspace/LowerWorkspaceDeck';

import SpatialBootSequence from './components/spatial/SpatialBootSequence';
import SpatialSystemNotification from './components/spatial/SpatialSystemNotification';

export const App: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);

  const {
    leftSidebarVisible,
    rightSidebarVisible,
    activePanel,
    setActivePanel,
    splitViewActive
  } = useUIStore();

  return (
    <div className="app-container">
      {/* Feature 1: Spatial Core Initialization Boot Animation */}
      <SpatialBootSequence />

      {/* Feature 10: Spatial AI Core Toast Notifications */}
      <SpatialSystemNotification />

      {/* Top Navbar */}
      <Header />

      {/* Main Spatial Workspace */}
      <main className="workspace">

        {/* Upper Region: Left Panel + Center Viewport + Right Panel */}
        <div className="workspace-upper">

          {/* ── Left Sidebar ────────────────────────────────────────────── */}
          <aside className={`sidebar left ${leftSidebarVisible ? '' : 'collapsed'}`}>
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
                WORLD STRUCTURE
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

          {/* ── Center 3D Viewport Layer ────────────────────────────────── */}
          <section className="viewport-container">
            {currentWorldState ? (
              <>
                {/* 9-Zone Centralized Viewport HUD Layer */}
                <ViewportHUDLayer />

                {/* AI Command Bar — floats at top-center via CSS .command-palette */}
                <CommandBar />

                {/* Core 3D canvas area (+ optional split 2D panel) */}
                <div className="viewport-shell">
                  {splitViewActive && (
                    <div className="split-2d-panel">
                      <TwoDViewer />
                    </div>
                  )}
                  <div className={splitViewActive ? 'viewport-3d-half' : 'viewport-3d-full'}>
                    <Viewport />
                  </div>
                </div>
              </>
            ) : (
              /* ── Empty / Intake State ───────────────────────────────── */
              <div className="intake-screen">
                <div className="intake-content">
                  {/* Wireframe Voxel Logo */}
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7L12 12V22L21 17V7L12 2Z" stroke="var(--vf-violet)" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 2L21 7L12 12L3 7L12 2Z" fill="var(--vf-lavender)" fillOpacity="0.2" stroke="var(--vf-soft-violet)" strokeWidth="1.0" />
                    <path d="M12 12L21 17L12 22V12Z" fill="var(--vf-gold)" fillOpacity="0.1" stroke="var(--vf-gold-soft)" strokeWidth="1.0" />
                  </svg>

                  <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: '600', fontSize: '15px', color: 'var(--vf-text-primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    SPATIAL CORE : AWAITING INTAKE
                  </h2>

                  <p style={{ color: 'var(--vf-text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
                    Voxel Forge processes visual blueprint inputs, biological tissue structures, and industrial CAD files, compiling them into a domain-agnostic semantic 3D database.
                  </p>

                  <div className="intake-instructions">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--vf-gold-soft)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
                      SYSTEM INSTRUCTIONS:
                    </span>
                    <ul style={{ color: 'var(--vf-text-secondary)', fontSize: '11px', paddingLeft: '14px', lineHeight: '1.8' }}>
                      <li>Access the <strong>Uploads Panel</strong> sheet on the left.</li>
                      <li>Drag a floorplan, MRI scan, or custom GLB model.</li>
                      <li>Click <strong>Process Input</strong> to reconstruct the spatial world.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Right Sidebar ───────────────────────────────────────────── */}
          <aside className={`sidebar right ${rightSidebarVisible ? '' : 'collapsed'}`}>
            <div className="panel-header">
              <span>ENTITY INTELLIGENCE</span>
              <Compass size={13} />
            </div>
            <div className="panel-content">
              <Inspector />
            </div>
          </aside>

        </div>

        {/* Lower Workspace Deck: 3 columns */}
        {currentWorldState && <LowerWorkspaceDeck />}

      </main>

      {/* Footer Status Indicators */}
      <Footer />
    </div>
  );
};

export default App;
