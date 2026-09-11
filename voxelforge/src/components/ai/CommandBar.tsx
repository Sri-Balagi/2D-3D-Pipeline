import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../../state/useUIStore';
import { useWorldStore } from '../../state/useWorldStore';
import { useSimulationStore } from '../../state/useSimulationStore';
import { Terminal, Sparkles, AlertCircle, History } from 'lucide-react';

// Generic contextual action configurations mapped to entity semanticClass
const CONTEXTUAL_ACTIONS: Record<string, { label: string; cmd: string }[]> = {
  // Architecture
  room: [
    { label: 'Explain Room Space', cmd: 'explain this' },
    { label: 'Show Connected Rooms', cmd: 'show relationships' },
    { label: 'Isolate Selected Room', cmd: 'isolate selected' },
    { label: 'Measure Room Area', cmd: 'measure space' }
  ],
  wall: [
    { label: 'Focus Wall Component', cmd: 'focus' },
    { label: 'Isolate Wall Boundary', cmd: 'isolate selected' }
  ],
  window: [
    { label: 'Focus Window Opening', cmd: 'focus' },
    { label: 'Isolate Window Frame', cmd: 'isolate selected' }
  ],
  door: [
    { label: 'Focus Door Portal', cmd: 'focus' },
    { label: 'Isolate Door Portal', cmd: 'isolate selected' }
  ],

  // Anatomy
  ventricle: [
    { label: 'Explain Ventricle Chamber', cmd: 'explain this' },
    { label: 'Focus Ventricle Chamber', cmd: 'focus' },
    { label: 'Isolate Ventricle Chamber', cmd: 'isolate selected' },
    { label: 'Show Outflow Vessels', cmd: 'show relationships' }
  ],
  atrium: [
    { label: 'Explain Atrium Chamber', cmd: 'explain this' },
    { label: 'Focus Atrium Chamber', cmd: 'focus' },
    { label: 'Isolate Atrium Chamber', cmd: 'isolate selected' },
    { label: 'Show Connected Valves', cmd: 'show relationships' }
  ],
  valve: [
    { label: 'Focus Cardiac Valve', cmd: 'focus' },
    { label: 'Isolate Cardiac Valve', cmd: 'isolate selected' },
    { label: 'Show Leaflet Relations', cmd: 'show relationships' }
  ],

  // Mechanical
  gear: [
    { label: 'Explain Gear Component', cmd: 'explain this' },
    { label: 'Show Meshing Gears', cmd: 'show relationships' },
    { label: 'Explode Gearbox Assembly', cmd: 'explode' },
    { label: 'Focus Gear Element', cmd: 'focus' },
    { label: 'Isolate Gear Element', cmd: 'isolate selected' }
  ],
  shaft: [
    { label: 'Explain Rotational Shaft', cmd: 'explain this' },
    { label: 'Explode Gearbox Assembly', cmd: 'explode' },
    { label: 'Focus Rotational Shaft', cmd: 'focus' },
    { label: 'Isolate Rotational Shaft', cmd: 'isolate selected' }
  ],
  bearing: [
    { label: 'Focus Bearing Support', cmd: 'focus' },
    { label: 'Isolate Bearing Support', cmd: 'isolate selected' },
    { label: 'Show Friction Relations', cmd: 'show relationships' }
  ]
};

export const CommandBar: React.FC = () => {
  const commandPaletteOpen = useUIStore((state) => state.commandPaletteOpen);
  const setVisualizationMode = useUIStore((state) => state.setVisualizationMode);
  const setExplosionFactor = useUIStore((state) => state.setExplosionFactor);
  const setCameraMode = useUIStore((state) => state.setCameraMode);
  
  // Phase 2 states
  const setFocusedEntityId = useUIStore((state) => state.setFocusedEntityId);
  const setIsolatedEntityId = useUIStore((state) => state.setIsolatedEntityId);
  const setLowConfidenceFilterActive = useUIStore((state) => state.setLowConfidenceFilterActive);
  const setShowRelationships = useUIStore((state) => state.setShowRelationships);

  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const updateVisualOverrides = useWorldStore((state) => state.updateVisualOverrides);
  const selectEntity = useWorldStore((state) => state.selectEntity);
  const commandHistory = useWorldStore((state) => state.commandHistory);
  const addCommandHistoryEntry = useWorldStore((state) => state.addCommandHistoryEntry);
  const clearCommandHistory = useWorldStore((state) => state.clearCommandHistory);

  const setSimulationStatus = useSimulationStore((state) => state.setSimulationStatus);
  const activeScenario = useSimulationStore((state) => state.activeScenario);
  const addEvent = useSimulationStore((state) => state.addEvent);

  const [inputVal, setInputVal] = useState('');
  const [consoleMsg, setConsoleMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Selected entity context mapping
  const selectedEntity = selectedEntityId && currentWorldState
    ? currentWorldState.entities[selectedEntityId]
    : null;

  const suggestionChips = selectedEntity && CONTEXTUAL_ACTIONS[selectedEntity.semanticClass]
    ? CONTEXTUAL_ACTIONS[selectedEntity.semanticClass]
    : [
        { label: 'Explain structure', cmd: 'explain this' },
        { label: 'Show low confidence', cmd: 'show low confidence' },
        { label: 'Isolate selected', cmd: 'isolate selected' },
        { label: 'Explode assembly', cmd: 'explode' },
        { label: 'Show relationships', cmd: 'show relationships' }
      ];

  const executeCommand = (cmdText: string) => {
    if (!cmdText.trim()) return;
    const cmd = cmdText.toLowerCase().trim();
    setConsoleMsg(null);
    setIsError(false);
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      if (!currentWorldState) {
        setIsError(true);
        const errMsg = 'Error: Active spatial buffer is empty. Load a world first.';
        setConsoleMsg(errMsg);
        
        addCommandHistoryEntry({
          id: `ai_resp_${Date.now()}`,
          prompt: cmdText,
          response: errMsg,
          highlightedEntities: [],
          suggestedActions: [],
          status: 'failed',
          timestamp: Date.now()
        });
        return;
      }

      const { entities } = currentWorldState;
      let feedback = '';

      // 1. Hide/Show rules
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
          ? `[MOCK AI RESPONSE] Executed: Hiding all entities of class '${cls}' (${count} items hidden).`
          : `[MOCK AI RESPONSE] Alert: No matching entities for semantic class '${cls}' found.`;
      } 
      else if (cmd.startsWith('show only ')) {
        const cls = cmd.replace('show only ', '').trim();
        const singularCls = cls.endsWith('s') ? cls.slice(0, -1) : cls;

        let count = 0;
        Object.values(entities).forEach((entity) => {
          if (entity.parentId === null) return;
          if (entity.semanticClass === singularCls || entity.type === singularCls) {
            updateVisualOverrides(entity.id, { visible: true });
          } else {
            updateVisualOverrides(entity.id, { visible: false });
            count++;
          }
        });
        feedback = `[MOCK AI RESPONSE] Focus: Isolating semantic class '${cls}'. (${count} other entities hidden)`;
      } 
      else if (cmd === 'show all' || cmd === 'reset visibility') {
        Object.values(entities).forEach((entity) => {
          updateVisualOverrides(entity.id, { visible: true });
        });
        setLowConfidenceFilterActive(false);
        setIsolatedEntityId(null);
        feedback = '[MOCK AI RESPONSE] Reset: All entity visibility overrides cleared. World visible.';
      }
      // 2. View modes
      else if (cmd.includes('wireframe') || cmd === 'wire') {
        setVisualizationMode('wireframe');
        feedback = "[MOCK AI RESPONSE] Mode: Render state set to WIREFRAME.";
      } 
      else if (cmd.includes('transparent') || cmd.includes('ghost')) {
        setVisualizationMode('ghost');
        feedback = "[MOCK AI RESPONSE] Mode: Render state set to GHOST (translucent).";
      } 
      else if (cmd.includes('holo')) {
        setVisualizationMode('holo');
        feedback = "[MOCK AI RESPONSE] Mode: Render state set to HOLO (lavender scan).";
      } 
      else if (cmd.includes('solid') || cmd.includes('normal')) {
        setVisualizationMode('solid');
        feedback = "[MOCK AI RESPONSE] Mode: Render state set to SOLID.";
      } 
      else if (cmd.includes('low confidence') || cmd.includes('show confidence')) {
        setLowConfidenceFilterActive(true);
        setVisualizationMode('confidence');
        feedback = "[MOCK AI RESPONSE] Filter: Showed low-confidence objects. Highlighted elements below 70% confidence.";
      }
      // 3. Explode
      else if (cmd.includes('explode')) {
        setExplosionFactor(1.5);
        feedback = '[MOCK AI RESPONSE] Transform: Mesh coordinates offset outwards (Explosion: 1.5).';
      } 
      else if (cmd.includes('collapse') || cmd.includes('unexplode') || cmd.includes('reset explode')) {
        setExplosionFactor(0.0);
        feedback = '[MOCK AI RESPONSE] Transform: Mesh offset set to 0.0.';
      }
      // 4. Simulations
      else if (cmd.includes('run simulation') || cmd.includes('start simulation') || cmd.includes('play')) {
        setSimulationStatus('playing');
        addEvent({
          id: `evt_cmd_${Date.now()}`,
          time: 0,
          type: 'info',
          description: `Simulation initialized via Voxel Console: '${activeScenario ?? 'Default'}'`,
        });
        feedback = `[MOCK AI RESPONSE] Simulation: Scenario '${activeScenario ?? 'Default'}' is ACTIVE.`;
      } 
      else if (cmd.includes('stop simulation') || cmd.includes('pause')) {
        setSimulationStatus('paused');
        feedback = '[MOCK AI RESPONSE] Simulation: Paused.';
      }
      // 5. Focusing
      else if (cmd.startsWith('focus on ') || cmd.startsWith('find ') || cmd === 'focus') {
        let targetEntity = selectedEntity;
        if (cmd.startsWith('focus on ') || cmd.startsWith('find ')) {
          const target = cmd.replace('focus on ', '').replace('find ', '').trim();
          targetEntity = Object.values(entities).find(
            (e) => e.id.toLowerCase() === target || (e.properties.name && String(e.properties.name).toLowerCase().includes(target))
          ) ?? null;
        }

        if (targetEntity) {
          selectEntity(targetEntity.id);
          setFocusedEntityId(targetEntity.id);
          feedback = `[MOCK AI RESPONSE] Tracking: Focused viewport on entity '${targetEntity.properties.name || targetEntity.id}'.`;
        } else {
          setIsError(true);
          feedback = `[MOCK AI RESPONSE] Error: Could not locate focus target in structure.`;
        }
      }
      else if (cmd === 'explain this') {
        if (selectedEntity && selectedEntity.id !== 'asset_root') {
          feedback = `[MOCK AI RESPONSE] AI INSIGHT: Selected entity '${selectedEntity.properties.name || selectedEntity.id}' has a confidence of ${Math.round(selectedEntity.confidence * 100)}%. Positioned at coordinates [${selectedEntity.transform.position.map(v => v.toFixed(2)).join(', ')}].`;
        } else {
          feedback = '[MOCK AI RESPONSE] Insight: Select a specific entity in the world tree to run explanation.';
        }
      }
      else if (cmd === 'isolate selected') {
        if (selectedEntity && selectedEntity.id !== 'asset_root') {
          setIsolatedEntityId(selectedEntity.id);
          feedback = `[MOCK AI RESPONSE] Focus: Isolated selected entity '${selectedEntity.properties.name || selectedEntity.id}'. All other nodes ghosted.`;
        } else {
          feedback = '[MOCK AI RESPONSE] Insight: Select a specific entity first to isolate it.';
        }
      }
      else if (cmd === 'show relationships') {
        if (selectedEntity && selectedEntity.id !== 'asset_root') {
          setShowRelationships(true);
          const rels = currentWorldState.relationships.filter(r => r.source === selectedEntity.id || r.target === selectedEntity.id);
          feedback = `[MOCK AI RESPONSE] Graph: Displaying ${rels.length} relationships mapped to '${selectedEntity.properties.name || selectedEntity.id}'.`;
        } else {
          feedback = '[MOCK AI RESPONSE] Insight: Select an entity to trace relations.';
        }
      }
      else if (cmd === 'reset view' || cmd === 'reset camera') {
        setCameraMode('orbit');
        setFocusedEntityId(null);
        setIsolatedEntityId(null);
        feedback = '[MOCK AI RESPONSE] Camera: Coordinates reset to default focus coordinates.';
      }
      // unrecognized
      else {
        setIsError(true);
        feedback = `[MOCK AI RESPONSE] Command unrecognized: '${cmdText}'. Available: 'hide windows', 'show only rooms', 'focus', 'isolate selected', 'show relationships', 'explode', 'holo', 'solid', 'explain this'.`;
      }

      setConsoleMsg(feedback);

      // Save into command history list
      addCommandHistoryEntry({
        id: `ai_resp_${Date.now()}`,
        prompt: cmdText,
        response: feedback,
        highlightedEntities: selectedEntityId ? [selectedEntityId] : [],
        suggestedActions: [],
        status: isError ? 'failed' : 'success',
        timestamp: Date.now()
      });
    }, 350);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    executeCommand(inputVal);
    setInputVal('');
  };

  return (
    <div className="command-palette" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '380px' }}>
      
      {/* Dynamic suggestion chips context display */}
      {selectedEntity && (
        <div style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--vf-lavender)', alignSelf: 'center', background: 'var(--vf-deep-violet)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--vf-border)' }}>
          CONTEXT: {selectedEntity.properties.name ? String(selectedEntity.properties.name).toUpperCase() : selectedEntity.id.toUpperCase()} ({selectedEntity.semanticClass.toUpperCase()})
        </div>
      )}

      {/* HUD Response Card */}
      {consoleMsg && (
        <div
          className="hud-card"
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            borderLeft: `2px solid ${isError ? 'var(--accent-red)' : 'var(--vf-gold)'}`,
            color: 'var(--vf-text-primary)',
            padding: '8px 12px',
            backgroundColor: 'var(--vf-panel-elevated)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
          }}
        >
          {isError ? (
            <AlertCircle size={12} style={{ color: 'var(--accent-red)' }} />
          ) : (
            <Sparkles size={12} style={{ color: 'var(--vf-gold)' }} />
          )}
          <span>{consoleMsg}</span>
        </div>
      )}

      {/* Main Bar */}
      <form onSubmit={handleFormSubmit} className="command-bar">
        <Terminal size={14} className="command-icon" style={{ color: 'var(--vf-soft-violet)' }} />
        <input
          ref={inputRef}
          type="text"
          className="command-input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask Voxel..."
        />
        
        {isProcessing && (
          <span 
            style={{ 
              fontSize: '8px', 
              fontFamily: 'var(--font-mono)', 
              color: 'var(--vf-gold)',
              letterSpacing: '1px',
              animation: 'pulse 1s infinite'
            }}
          >
            ANALYZING REQUEST...
          </span>
        )}
      </form>

      {/* Suggestion Chips */}
      <div 
        style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '6px', 
          justifyContent: 'center',
          padding: '0 4px'
        }}
      >
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="suggestion-chip"
            onClick={() => executeCommand(chip.cmd)}
            style={{
              background: 'rgba(13, 10, 24, 0.6)',
              border: '1px solid var(--vf-border)',
              borderRadius: '12px',
              padding: '3px 8px',
              fontSize: '9px',
              fontFamily: 'var(--font-sans)',
              color: 'var(--vf-text-secondary)',
              cursor: 'pointer',
              transition: 'all var(--vf-transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--vf-violet)';
              e.currentTarget.style.color = 'var(--vf-lavender)';
              e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--vf-border)';
              e.currentTarget.style.color = 'var(--vf-text-secondary)';
              e.currentTarget.style.backgroundColor = 'rgba(13, 10, 24, 0.6)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Command History Log HUD (Collapsible) */}
      {commandHistory.length > 0 && (
        <div 
          style={{ 
            background: 'rgba(13, 10, 24, 0.5)', 
            border: '1px solid var(--vf-border)', 
            borderRadius: '6px', 
            padding: '6px',
            maxHeight: '100px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '3px', marginBottom: '2px' }}>
            <span style={{ fontSize: '8px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <History size={10} /> RECENT LOGS
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); clearCommandHistory(); }}
              style={{ background: 'none', border: 'none', color: 'var(--vf-text-muted)', fontSize: '8px', cursor: 'pointer' }}
            >
              CLEAR
            </button>
          </div>
          {commandHistory.map((hist) => (
            <div key={hist.id} style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', color: 'var(--vf-text-secondary)' }}>
              <span style={{ color: hist.status === 'success' ? 'var(--vf-soft-violet)' : 'var(--accent-red)' }}>&gt; {hist.prompt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandBar;
