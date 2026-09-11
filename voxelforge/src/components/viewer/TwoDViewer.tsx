import React, { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export const TwoDViewer: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);
  const selectEntity = useWorldStore((state) => state.selectEntity);

  const domain = currentWorldState?.metadata.domain ?? 'generic';

  // Navigation states for Pan & Zoom
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const nextScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
    setScale(Math.max(0.5, Math.min(6, nextScale)));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Render SVG vector blueprint according to active domain
  const renderVectorBlueprint = () => {
    switch (domain) {
      case 'architecture':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" stroke="var(--vf-lavender)" fill="none" strokeWidth="0.6">
            {/* Outer Wall Boundary */}
            <rect x="10" y="10" width="80" height="80" stroke="var(--vf-violet)" strokeWidth="1.2" />
            
            {/* Rooms Divisions */}
            <line x1="10" y1="50" x2="90" y2="50" />
            <line x1="50" y1="10" x2="50" y2="90" />
            
            {/* Doors & Windows mock indications */}
            <rect x="25" y="48" width="6" height="4" fill="rgba(124, 58, 237, 0.2)" stroke="var(--vf-violet)" onClick={() => selectEntity('door_bedroom')} style={{ cursor: 'pointer' }} />
            <rect x="48" y="25" width="4" height="6" fill="rgba(124, 58, 237, 0.2)" stroke="var(--vf-violet)" onClick={() => selectEntity('door_living')} style={{ cursor: 'pointer' }} />
            
            <circle cx="30" cy="30" r="4" fill={selectedEntityId === 'bedroom' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('bedroom')} style={{ cursor: 'pointer' }} />
            
            {/* Text labels */}
            <text x="15" y="18" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">BEDROOM_01</text>
            <text x="55" y="18" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">LIVING_ROOM</text>
            <text x="15" y="58" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">KITCHEN</text>
            <text x="55" y="58" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">BATHROOM</text>
            
            <text x="12" y="93" fill="var(--vf-text-muted)" fontSize="2" fontFamily="var(--font-mono)">SCALE 1:50 | DEMO INPUT FLOORPLAN</text>
          </svg>
        );
      case 'anatomy':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" stroke="var(--vf-lavender)" fill="none" strokeWidth="0.6">
            {/* Cardiac cross-section map */}
            <path d="M50 15 C15 15, 15 65, 50 90 C85 65, 85 15, 50 15 Z" stroke="var(--vf-violet)" strokeWidth="1.2" />
            
            {/* Chambers */}
            <circle cx="35" cy="40" r="10" fill={selectedEntityId === 'left_atrium' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('left_atrium')} style={{ cursor: 'pointer' }} />
            <circle cx="65" cy="40" r="10" fill={selectedEntityId === 'right_atrium' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('right_atrium')} style={{ cursor: 'pointer' }} />
            
            <circle cx="35" cy="65" r="12" fill={selectedEntityId === 'left_ventricle' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('left_ventricle')} style={{ cursor: 'pointer' }} />
            <circle cx="65" cy="65" r="12" fill={selectedEntityId === 'right_ventricle' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('right_ventricle')} style={{ cursor: 'pointer' }} />

            <text x="25" y="28" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">ATRIUM_L</text>
            <text x="58" y="28" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">ATRIUM_R</text>
            <text x="23" y="78" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">VENTRICLE_L</text>
            <text x="55" y="78" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">VENTRICLE_R</text>
            
            <text x="12" y="93" fill="var(--vf-text-muted)" fontSize="2" fontFamily="var(--font-mono)">SCAN RESOLUTION: 0.2MM | MRI CORONAL SECTOR</text>
          </svg>
        );
      case 'mechanical':
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" stroke="var(--vf-lavender)" fill="none" strokeWidth="0.6">
            {/* Gear cogs wireframe diagram */}
            <circle cx="35" cy="50" r="18" stroke="var(--vf-violet)" strokeWidth="1.2" fill={selectedEntityId === 'gear_driver' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('gear_driver')} style={{ cursor: 'pointer' }} />
            <circle cx="35" cy="50" r="4" />
            
            <circle cx="68" cy="50" r="22" stroke="var(--vf-violet)" strokeWidth="1.2" fill={selectedEntityId === 'gear_driven' ? 'rgba(212, 175, 106, 0.2)' : 'none'} onClick={() => selectEntity('gear_driven')} style={{ cursor: 'pointer' }} />
            <circle cx="68" cy="50" r="5" />
            
            {/* Intersecting cogs dash */}
            <circle cx="35" cy="50" r="20" strokeDasharray="1.5,1.5" />
            <circle cx="68" cy="50" r="20" strokeDasharray="1.5,1.5" />

            <text x="18" y="28" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">DRIVE_GEAR (20T)</text>
            <text x="52" y="24" fill="var(--vf-gold-soft)" fontSize="3.5" fontFamily="var(--font-mono)">DRIVEN_GEAR (22T)</text>
            
            <text x="12" y="93" fill="var(--vf-text-muted)" fontSize="2" fontFamily="var(--font-mono)">CAD MODEL IDENT: MECH_77B | ORTHOGRAPHIC TOP VIEW</text>
          </svg>
        );
      default:
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100" stroke="var(--vf-lavender)" fill="none" strokeWidth="0.6">
            <rect x="15" y="15" width="70" height="70" stroke="var(--vf-border)" />
            <text x="25" y="52" fill="var(--vf-text-muted)" fontSize="4" fontFamily="var(--font-mono)">GENERIC 2D EVIDENCE INPUT</text>
          </svg>
        );
    }
  };

  return (
    <div 
      ref={viewerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--vf-bg-sec)',
        overflow: 'hidden',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--vf-border)'
      }}
    >
      {/* Zoom / Pan Container */}
      <div 
        style={{
          width: '85%',
          height: '85%',
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          pointerEvents: 'auto'
        }}
      >
        {renderVectorBlueprint()}
      </div>

      {/* Floating CAD HUD navigation controls */}
      <div 
        style={{ 
          position: 'absolute', 
          bottom: '12px', 
          right: '12px', 
          display: 'flex', 
          gap: '4px',
          background: 'var(--vf-panel-elevated)',
          border: '1px solid var(--vf-border)',
          borderRadius: '4px',
          padding: '4px',
          zIndex: 5
        }}
      >
        <button 
          onClick={() => setScale(Math.min(6, scale * 1.2))}
          style={{ width: '20px', height: '20px', background: 'none', border: 'none', color: 'var(--vf-text-primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        >
          +
        </button>
        <button 
          onClick={() => setScale(Math.max(0.5, scale / 1.2))}
          style={{ width: '20px', height: '20px', background: 'none', border: 'none', color: 'var(--vf-text-primary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
        >
          -
        </button>
        <button 
          onClick={resetView}
          style={{ height: '20px', background: 'none', border: 'none', color: 'var(--vf-text-secondary)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '9px', padding: '0 4px' }}
        >
          RESET
        </button>
      </div>
      
      {/* Title Tag */}
      <div 
        style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '8px',
          color: 'var(--vf-gold-soft)',
          background: 'rgba(7, 6, 13, 0.75)',
          padding: '2px 6px',
          borderRadius: '2px',
          border: '1px solid var(--vf-border)'
        }}
      >
        2D_SOURCE_EVIDENCE ({domain.toUpperCase()})
      </div>
    </div>
  );
};

export default TwoDViewer;
