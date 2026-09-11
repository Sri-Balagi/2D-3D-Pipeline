# index.css

``css
/* Custom CSS Variables for High-Tech dark IDE Theme */
:root {
  --bg-primary: #0a0b0d;
  --bg-secondary: #11141a;
  --bg-panel: #141822;
  --bg-hover: #1e2535;
  --bg-active: #252f44;
  --border-color: #2b3548;
  --border-active: #06b6d4;
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --accent-cyan: #06b6d4;
  --accent-cyan-glow: rgba(6, 182, 212, 0.25);
  --accent-orange: #f97316;
  --accent-green: #10b981;
  --accent-red: #ef4444;
  --accent-purple: #a855f7;
  
  --font-mono: "Courier New", Courier, monospace, SFMono-Regular, Menlo, Monaco, Consolas;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  
  --sidebar-width: 320px;
  --header-height: 48px;
  --footer-height: 36px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
}

/* Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--accent-cyan);
}

/* Layout Elements */
.app-container {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  background-color: var(--bg-primary);
}

.top-nav {
  height: var(--header-height);
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 10;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--accent-cyan);
  text-shadow: 0 0 8px var(--accent-cyan-glow);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-size: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 4px 10px;
  border-radius: 4px;
  font-family: var(--font-mono);
}

.meta-label {
  color: var(--text-secondary);
}

.meta-value {
  color: var(--text-primary);
  font-weight: bold;
}

.workspace {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
  height: calc(100vh - var(--header-height) - var(--footer-height));
}

/* Sidebar Panels */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--bg-panel);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, width 0.2s ease;
  z-index: 5;
  height: 100%;
}

.sidebar.right {
  border-right: none;
  border-left: 1px solid var(--border-color);
}

.sidebar.collapsed {
  width: 0;
  overflow: hidden;
  border: none;
}

.panel-header {
  height: 40px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  background-color: var(--bg-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--accent-cyan);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tabs */
.tabs-header {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.tab-btn {
  flex: 1;
  padding: 8px 12px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent-cyan);
  border-bottom-color: var(--accent-cyan);
  background: var(--bg-panel);
}

/* Main Viewport Container */
.viewport-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;
  background-color: var(--bg-primary);
}

.canvas-wrapper {
  flex: 1;
  position: relative;
  outline: none;
}

/* View Studio Overlay */
.view-studio {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(20, 24, 34, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(10px);
  z-index: 4;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  max-width: 90%;
  overflow-x: auto;
}

.studio-group {
  display: flex;
  align-items: center;
  gap: 4px;
  border-right: 1px solid var(--border-color);
  padding-right: 8px;
}

.studio-group:last-child {
  border-right: none;
  padding-right: 0;
}

.studio-btn {
  background: none;
  border: 1px solid transparent;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.studio-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.studio-btn.active {
  background: var(--accent-cyan-glow);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

/* Command Palette / Input */
.command-palette {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 480px;
  max-width: 90%;
  z-index: 4;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.command-bar {
  display: flex;
  align-items: center;
  background-color: rgba(20, 24, 34, 0.9);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 4px 8px;
  gap: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: border-color 0.2s;
}

.command-bar:focus-within {
  border-color: var(--accent-cyan);
}

.command-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 6px 0;
}

.command-input::placeholder {
  color: var(--text-muted);
}

.command-icon {
  color: var(--text-muted);
}

/* Buttons */
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: var(--bg-hover);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.15s ease;
}

.btn:hover {
  background-color: var(--bg-active);
  border-color: var(--text-secondary);
}

.btn.primary {
  background-color: var(--accent-cyan-glow);
  border-color: var(--accent-cyan);
  color: var(--accent-cyan);
}

.btn.primary:hover {
  background-color: var(--accent-cyan);
  color: var(--bg-primary);
}

.btn-small {
  padding: 4px 8px;
  font-size: 11px;
}

/* Tree Component */
.tree-node {
  display: flex;
  flex-direction: column;
  font-family: var(--font-mono);
}

.tree-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-bottom: 2px;
}

.tree-row:hover {
  background-color: var(--bg-hover);
}

.tree-row.selected {
  background-color: var(--bg-active);
  border-left: 2px solid var(--accent-cyan);
}

.tree-label {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tree-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Key-Value Tables for Inspector */
.property-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.property-table th, .property-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  font-size: 12px;
}

.property-table th {
  font-family: var(--font-mono);
  color: var(--text-secondary);
  font-weight: 500;
  width: 35%;
}

.property-table td {
  font-family: var(--font-mono);
  color: var(--text-primary);
  word-break: break-all;
}

.section-title {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-top: 14px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 2px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Confidence indicator */
.confidence-badge {
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid transparent;
  font-weight: bold;
}

.confidence-high {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--accent-green);
  border-color: var(--accent-green);
}

.confidence-med {
  background-color: rgba(234, 179, 8, 0.1);
  color: #eab308;
  border-color: #eab308;
}

.confidence-low {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--accent-red);
  border-color: var(--accent-red);
}

/* Helper utilities */
.flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.flex-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.text-cyan { color: var(--accent-cyan); }
.text-muted { color: var(--text-muted); }

/* Overlay HUDs inside viewer */
.hud-card {
  background-color: rgba(20, 24, 34, 0.85);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  backdrop-filter: blur(8px);
  font-size: 12px;
}

/* Footer status bar */
.footer {
  height: var(--footer-height);
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.footer-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Upload Panel Styles */
.upload-zone {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 30px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  background-color: rgba(20, 24, 34, 0.2);
}

.upload-zone:hover {
  border-color: var(--accent-cyan);
  background-color: rgba(6, 182, 212, 0.05);
}

.upload-zone-icon {
  color: var(--text-muted);
  width: 32px;
  height: 32px;
}

.upload-zone:hover .upload-zone-icon {
  color: var(--accent-cyan);
}

/* Simulation Controls */
.sim-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px;
}

.sim-timeline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 10px;
}

.timeline-slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-slider {
  flex: 1;
  accent-color: var(--accent-cyan);
  cursor: pointer;
}

.sim-speed-btn {
  background: none;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
  cursor: pointer;
}

.sim-speed-btn.active {
  background: var(--accent-cyan-glow);
  color: var(--accent-cyan);
  border-color: var(--accent-cyan);
}

.sim-metric-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sim-metric-val {
  font-size: 20px;
  font-family: var(--font-mono);
  color: var(--accent-cyan);
  font-weight: bold;
}

``