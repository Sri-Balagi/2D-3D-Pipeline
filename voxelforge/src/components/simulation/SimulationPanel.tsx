import React, { useEffect, useRef } from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';
import type { SimEvent } from '../../state/useSimulationStore';
import { useWorldStore } from '../../state/useWorldStore';
import { Play, Pause, RotateCcw, Activity, FileText } from 'lucide-react';
import { DOMAIN_SCHEMAS } from '../../types/semantic';

export const SimulationPanel: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  
  const {
    simulationStatus,
    currentTime,
    duration,
    speed,
    activeScenario,
    metrics,
    events,
    setSimulationStatus,
    setCurrentTime,
    setSpeed,
    setActiveScenario,
    setEntitySimState,
    setMetrics,
    addEvent,
    resetSimulation
  } = useSimulationStore();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const domain = currentWorldState?.metadata.domain;
  const domainSchema = domain ? DOMAIN_SCHEMAS[domain] : null;

  // Initialize default scenario when world changes
  useEffect(() => {
    if (domainSchema && domainSchema.supportedSimulations.length > 0) {
      setActiveScenario(domainSchema.supportedSimulations[0].id);
    } else {
      setActiveScenario(null);
    }
    resetSimulation();
  }, [domain, setActiveScenario, resetSimulation]);

  // Simulation Tick Logic
  useEffect(() => {
    if (simulationStatus !== 'playing') {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const tick = (now: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
        animationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      // Update simulation time
      const nextTime = currentTime + deltaSec * speed;
      if (nextTime >= duration) {
        setCurrentTime(duration);
        setSimulationStatus('stopped');
        
        addEvent({
          id: `evt_end_${Date.now()}`,
          time: duration,
          type: 'success',
          description: 'Simulation scenario completed.',
        });
        return;
      }

      setCurrentTime(nextTime);
      runPhysicsStep(nextTime);

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [simulationStatus, currentTime, speed, duration]);

  const runPhysicsStep = (time: number) => {
    if (!currentWorldState) return;

    if (domain === 'mechanical') {
      const inputRotation = time * 2; // input speed
      const outputRotation = -time * (2 / 2.2); // output speed
      
      setEntitySimState('input_shaft', { rotation: [0, 0, inputRotation + Math.PI / 2] });
      setEntitySimState('gear_driver', { rotation: [0, inputRotation, 0] });
      setEntitySimState('output_shaft', { rotation: [0, 0, outputRotation + Math.PI / 2] });
      setEntitySimState('gear_driven', { rotation: [0, outputRotation, 0] });

      setMetrics({
        'Input Speed': `${Math.round(2 * 60 / (2 * Math.PI) * speed)} RPM`,
        'Output Speed': `${Math.round(Math.abs(2 / 2.2 * 60 / (2 * Math.PI) * speed))} RPM`,
        'Max Tooth Stress': `${(110 + Math.sin(time * 5) * 8).toFixed(1)} MPa`,
        'Vibration RMS': `${(0.04 + Math.sin(time * 20) * 0.01).toFixed(3)} mm/s`
      });

      if (Math.floor(time) % 15 === 0 && Math.floor(time) !== 0) {
        const checkSec = Math.floor(time);
        const eventId = `evt_mech_${checkSec}`;
        if (!events.some(e => e.id === eventId)) {
          addEvent({
            id: eventId,
            time: checkSec,
            type: 'info',
            description: `Vibration and gear harmonics alignment verified at ${checkSec}s.`,
          });
        }
      }
    } 
    else if (domain === 'anatomy') {
      const heartRate = 75;
      const beatFrequency = heartRate / 60;
      const angle = 2 * Math.PI * beatFrequency * time;
      
      const rightAtriumPulse = 1.0 + Math.sin(angle) * 0.1;
      const leftAtriumPulse = 1.0 + Math.sin(angle) * 0.1;
      const rightVentriclePulse = 1.0 - Math.sin(angle - Math.PI/2) * 0.15;
      const leftVentriclePulse = 1.0 - Math.sin(angle - Math.PI/2) * 0.18;
      
      setEntitySimState('right_atrium', { scale: [rightAtriumPulse, rightAtriumPulse, rightAtriumPulse] });
      setEntitySimState('left_atrium', { scale: [leftAtriumPulse, leftAtriumPulse, leftAtriumPulse] });
      setEntitySimState('right_ventricle', { scale: [rightVentriclePulse, rightVentriclePulse, rightVentriclePulse] });
      setEntitySimState('left_ventricle', { scale: [leftVentriclePulse, leftVentriclePulse, leftVentriclePulse] });

      setMetrics({
        'Heart Rate': '75 bpm',
        'Mitral Velocity': `${(18 + Math.max(0, Math.sin(angle)) * 65).toFixed(0)} cm/s`,
        'Aortic Velocity': `${(12 + Math.max(0, Math.sin(angle - Math.PI/2)) * 120).toFixed(0)} cm/s`,
        'Systolic Phase': Math.sin(angle - Math.PI/2) > 0 ? 'Systole' : 'Diastole'
      });

      if (Math.abs(Math.sin(angle - Math.PI/2) - 1.0) < 0.05) {
        const beatNum = Math.floor(time * beatFrequency);
        const eventId = `evt_heart_${beatNum}`;
        if (!events.some(e => e.id === eventId)) {
          addEvent({
            id: eventId,
            time: parseFloat(time.toFixed(1)),
            type: 'info',
            description: `Systole Peak (Beat #${beatNum}) - Aortic valve open.`,
          });
        }
      }
    }
    else if (domain === 'architecture') {
      const totalAgents = 24;
      const escapeRate = 0.4;
      const escaped = Math.min(totalAgents, Math.floor(time * escapeRate));
      const active = totalAgents - escaped;
      
      setMetrics({
        'Total Evacuating': totalAgents,
        'Active Inside': active,
        'Cleared Agents': escaped,
        'Est. Escape Ratio': escaped === totalAgents ? '100%' : `${Math.round(escaped / totalAgents * 100)}%`
      });

      if (active > 15) {
        setEntitySimState('living_room', { color: '#ef4444' });
      } else if (active > 5) {
        setEntitySimState('living_room', { color: '#d4af6a' }); // Theme Gold
      } else {
        setEntitySimState('living_room', { color: '#7c3aed' }); // Theme Violet
      }

      if (escaped > 0 && escaped % 4 === 0) {
        const eventId = `evt_arch_${escaped}`;
        if (!events.some(e => e.id === eventId)) {
          addEvent({
            id: eventId,
            time: parseFloat(time.toFixed(1)),
            type: escaped === totalAgents ? 'success' : 'info',
            description: escaped === totalAgents 
              ? `All ${totalAgents} agents cleared. Structures vacant.`
              : `Evacuation progress: ${escaped} agents reached exit.`,
          });
        }
      }
    }
  };

  const handlePlayPause = () => {
    if (simulationStatus === 'playing') {
      setSimulationStatus('paused');
    } else {
      if (simulationStatus === 'stopped' || currentTime >= duration) {
        setCurrentTime(0);
        resetSimulation();
      }
      setSimulationStatus('playing');
      
      addEvent({
        id: `evt_start_${Date.now()}`,
        time: currentTime,
        type: 'info',
        description: `Starting scenario: ${activeScenario ?? 'Default Simulation'}`,
      });
    }
  };

  const handleReset = () => {
    resetSimulation();
    if (domain === 'mechanical') {
      setEntitySimState('input_shaft', { rotation: [0, 0, Math.PI / 2] });
      setEntitySimState('gear_driver', { rotation: [0, 0, 0] });
      setEntitySimState('output_shaft', { rotation: [0, 0, Math.PI / 2] });
      setEntitySimState('gear_driven', { rotation: [0, 0, 0] });
    }
    else if (domain === 'anatomy') {
      setEntitySimState('right_atrium', { scale: [1, 1, 1] });
      setEntitySimState('left_atrium', { scale: [1, 1, 1] });
      setEntitySimState('right_ventricle', { scale: [1, 1, 1] });
      setEntitySimState('left_ventricle', { scale: [1, 1, 1] });
    }
    else if (domain === 'architecture') {
      setEntitySimState('living_room', { color: undefined });
    }
  };

  const getEventIconColor = (type: SimEvent['type']) => {
    switch (type) {
      case 'warning': return 'var(--vf-gold)'; // Soft warning
      case 'critical': return 'var(--accent-red)';
      case 'success': return 'var(--vf-gold-soft)'; // Important
      case 'info':
      default:
        return 'var(--vf-violet)'; // System active
    }
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  if (!currentWorldState) {
    return (
      <div className="text-muted" style={{ padding: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        No project loaded. Cannot configure simulation.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* Scenario Selector */}
      <div className="flex-col">
        <label className="text-muted" style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>ACTIVE SCENARIO</label>
        <select
          value={activeScenario ?? ''}
          onChange={(e) => setActiveScenario(e.target.value || null)}
          style={{
            background: 'var(--vf-bg)',
            color: 'var(--vf-text-primary)',
            border: '1px solid var(--vf-border)',
            padding: '6px 8px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          {domainSchema?.supportedSimulations.map((sim) => (
            <option key={sim.id} value={sim.id}>
              {sim.name.toUpperCase()}
            </option>
          ))}
          {!domainSchema?.supportedSimulations.length && (
            <option value="">NO SIMULATION SCHEMAS</option>
          )}
        </select>
      </div>

      {/* Timeline Controls */}
      <div className="sim-controls" style={{ background: 'rgba(13, 10, 24, 0.4)', border: '1px solid var(--vf-border)', borderRadius: '6px', padding: '8px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-small" onClick={handlePlayPause} style={{ color: 'var(--vf-lavender)', borderColor: 'var(--vf-violet)', backgroundColor: 'rgba(124, 58, 237, 0.1)' }}>
            {simulationStatus === 'playing' ? <Pause size={12} /> : <Play size={12} />}
          </button>
          <button className="btn btn-small" onClick={handleReset}>
            <RotateCcw size={12} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              className={`sim-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="sim-timeline">
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--vf-text-secondary)' }}>
          <span>T_TIME: {formatTime(currentTime)}</span>
          <span>DURATION: {formatTime(duration)}</span>
        </div>
        <div className="timeline-slider-container">
          <input
            type="range"
            min="0"
            max={duration}
            step="0.05"
            value={currentTime}
            onChange={(e) => {
              setCurrentTime(parseFloat(e.target.value));
              runPhysicsStep(parseFloat(e.target.value));
            }}
            className="timeline-slider vf-slider"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Metrics HUD */}
      <div>
        <div className="section-title">
          <span>Simulation Metrics</span>
          <Activity size={12} style={{ color: 'var(--vf-soft-violet)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          {Object.entries(metrics).map(([key, val]) => (
            <div key={key} className="sim-metric-card" style={{ background: 'rgba(13, 10, 24, 0.4)', border: '1px solid var(--vf-border)', borderRadius: '6px', padding: '10px' }}>
              <span style={{ fontSize: '9px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</span>
              <span className="sim-metric-val" style={{ color: 'var(--vf-text-primary)', fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: '600' }}>{val}</span>
            </div>
          ))}
          {Object.keys(metrics).length === 0 && (
            <div className="text-muted" style={{ gridColumn: 'span 2', padding: '16px', fontSize: '11px', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
              AWAITING SIMULATION TRIGGER
            </div>
          )}
        </div>
      </div>

      {/* Simulation Logs / Event Feed */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '120px' }}>
        <div className="section-title">
          <span>Simulation Events</span>
          <FileText size={12} style={{ color: 'var(--vf-soft-violet)' }} />
        </div>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'rgba(13, 10, 24, 0.4)',
            border: '1px solid var(--vf-border)',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {events.map((evt) => (
            <div key={evt.id} style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.01)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0, fontSize: '10px' }}>
                [{evt.time.toFixed(1)}s]
              </span>
              <span style={{ color: getEventIconColor(evt.type), fontWeight: 'bold', flexShrink: 0, fontSize: '10px' }}>
                ●
              </span>
              <span style={{ color: 'var(--vf-text-primary)', fontSize: '11px' }}>{evt.description}</span>
            </div>
          ))}
          {events.length === 0 && (
            <div className="text-muted" style={{ padding: '16px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
              EVENT BUFFER EMPTY
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationPanel;
