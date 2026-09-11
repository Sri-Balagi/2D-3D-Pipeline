# CommandBar.tsx

``tsx
import React, { useState } from 'react';
import { useUIStore } from '../../state/useUIStore';
import { useWorldStore } from '../../state/useWorldStore';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Terminal } from 'lucide-react';

export const CommandBar: React.FC = () => {
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const setVisualizationMode = useUIStore((state) => state.setVisualizationMode);
  const setExplosionFactor = useUIStore((state) => state.setExplosionFactor);
  const setCameraMode = useUIStore((state) => state.setCameraMode);

  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const updateVisualOverrides = useWorldStore((state) => state.updateVisualOverrides);
  const selectEntity = useWorldStore((state) => state.selectEntity);

  const setSimulationStatus = useSimulationStore((state) => state.setSimulationStatus);
  const activeScenario = useSimulationStore((state) => state.activeScenario);
  const addEvent = useSimulationStore((state) => state.addEvent);

  const [inputVal, setInputVal] = useState('');
  const [consoleMsg, setConsoleMsg] = useState<string | null>(null);

  if (!commandPaletteOpen) return null;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const cmd = inputVal.toLowerCase().trim();
    setConsoleMsg(null);

    // Context check
    if (!currentWorldState) {
      setConsoleMsg('Error: No active world loaded. Load a preset or blueprint first.');
      setInputVal('');
      return;
    }

    const { entities } = currentWorldState;
    let feedback = '';

    // 1. Visibilities: "hide all X", "show only Y"
    if (cmd.startsWith('hide all ') || cmd.startsWith('hide ')) {
      const cls = cmd.replace('hide all ', '').replace('hide ', '').trim();
      const singularCls = cls.endsWith('s') ? cls.slice(0, -1) : cls;
      
      let count = 0;
      Object.values(entities).forEach((entity) => {
        if (entity.semanticClass === singularCls || entity.type === singularCls) {
          updateVisualOverrides(entity.id, { visible: false });
          count++;
        }
      });
      feedback = count > 0 
        ? `Validated Action: HIDED all '${cls}'. (${count} entities affected)`
        : `Validated Action: No entities matching '${cls}' found.`;
    } 
    else if (cmd.startsWith('show only ')) {
      const cls = cmd.replace('show only ', '').trim();
      const singularCls = cls.endsWith('s') ? cls.slice(0, -1) : cls;

      let count = 0;
      Object.values(entities).forEach((entity) => {
        if (entity.parentId === null) return; // Keep ground floor/root visible
        if (entity.semanticClass === singularCls || entity.type === singularCls) {
          updateVisualOverrides(entity.id, { visible: true });
        } else {
          updateVisualOverrides(entity.id, { visible: false });
          count++;
        }
      });
      feedback = `Validated Action: Displaying ONLY '${cls}'. (${count} other entities hidden)`;
    } 
    else if (cmd === 'show all' || cmd === 'reset visibility') {
      Object.values(entities).forEach((entity) => {
        updateVisualOverrides(entity.id, { visible: true });
      });
      feedback = 'Validated Action: Visual overrides cleared. All entities visible.';
    }
    // 2. View modes: "make building transparent", "show wireframe", "holo view"
    else if (cmd.includes('wireframe')) {
      setVisualizationMode('wireframe');
      feedback = "Validated Action: Visualization mode set to 'WIREFRAME'.";
    } 
    else if (cmd.includes('transparent') || cmd.includes('ghost')) {
      setVisualizationMode('ghost');
      feedback = "Validated Action: Visualization mode set to 'GHOST' (Transparency).";
    } 
    else if (cmd.includes('holo')) {
      setVisualizationMode('holo');
      feedback = "Validated Action: Visualization mode set to 'HOLO' (Glowing Edges).";
    } 
    else if (cmd.includes('solid') || cmd.includes('normal')) {
      setVisualizationMode('solid');
      feedback = "Validated Action: Visualization mode set to 'SOLID' (Realistic).";
    } 
    else if (cmd.includes('low confidence') || cmd.includes('show confidence')) {
      setVisualizationMode('confidence');
      feedback = "Validated Action: Visualization mode set to 'CONFIDENCE'. Highlights low-confidence perception items.";
    }
    // 3. Structural Explosion: "explode model", "reset explode"
    else if (cmd.includes('explode')) {
      setExplosionFactor(1.5);
      feedback = 'Validated Action: Displaced assembly meshes outwards (Explosion: 1.5).';
    } 
    else if (cmd.includes('collapse') || cmd.includes('unexplode') || cmd.includes('reset explode')) {
      setExplosionFactor(0.0);
      feedback = 'Validated Action: Reset mesh explosion to 0.0.';
    }
    // 4. Simulations: "run evacuation", "start simulation", "pause simulation"
    else if (cmd.includes('run simulation') || cmd.includes('start simulation') || cmd.includes('play')) {
      setSimulationStatus('playing');
      addEvent({
        id: `evt_cmd_${Date.now()}`,
        time: 0,
        type: 'info',
        description: `Simulation triggered via AI Command console: '${activeScenario ?? 'Default'}'`,
      });
      feedback = `Validated Action: Running simulation scenario: '${activeScenario ?? 'Default'}'`;
    } 
    else if (cmd.includes('stop simulation') || cmd.includes('pause')) {
      setSimulationStatus('paused');
      feedback = 'Validated Action: Simulation paused.';
    }
    // 5. Focusing: "focus on X", "find Y"
    else if (cmd.startsWith('focus on ') || cmd.startsWith('find ')) {
      const target = cmd.replace('focus on ', '').replace('find ', '').trim();
      const entity = Object.values(entities).find(
        (e) => e.id.toLowerCase() === target || (e.properties.name && String(e.properties.name).toLowerCase().includes(target))
      );
      
      if (entity) {
        selectEntity(entity.id);
        setCameraMode('orbit'); // ensure orbit mode is on to auto-focus
        feedback = `Validated Action: Camera centered and focused on entity: '${entity.properties.name || entity.id}'.`;
      } else {
        feedback = `Error: Could not locate entity matching label '${target}'.`;
      }
    } 
    else if (cmd === 'reset view' || cmd === 'reset camera') {
      setCameraMode('orbit');
      feedback = 'Validated Action: Resetting viewport camera coordinates.';
    }
    // Default fallback
    else {
      feedback = `Perception Command unrecognized: '${inputVal}'. For Phase 1 try 'hide windows', 'show only rooms', 'explode', 'holo view', 'run simulation'.`;
    }

    setConsoleMsg(feedback);
    setInputVal('');
  };

  return (
    <div className="command-palette">
      {/* Console output feedback message */}
      {consoleMsg && (
        <div
          className="hud-card"
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            borderLeft: '3px solid var(--accent-cyan)',
            color: 'var(--text-primary)',
            padding: '6px 12px'
          }}
        >
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>[VOXEL_CORE]</span> {consoleMsg}
        </div>
      )}

      {/* Command Form */}
      <form onSubmit={handleCommandSubmit} className="command-bar">
        <Terminal size={14} className="command-icon" />
        <input
          type="text"
          className="command-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Voxel Forge... (e.g. 'hide windows', 'show only bedrooms', 'explode')"
          autoFocus
        />
      </form>
    </div>
  );
};
export default CommandBar;

``