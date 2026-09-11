import React, { useMemo } from 'react';
import { useUIStore } from '../../state/useUIStore';
import { useWorldStore } from '../../state/useWorldStore';
import ConfidenceLegendOverlay from './ConfidenceLegendOverlay';
import WarningCardsOverlay from './WarningCardsOverlay';
import RelationshipOverlayCard from './RelationshipOverlayCard';
import ViewStudio from '../visualization/ViewStudio';

export const ViewportHUDLayer: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);
  const selectedEntityId = useWorldStore((state) => state.selectedEntityId);

  const {
    visualizationMode,
    focusedEntityId,
    setFocusedEntityId,
    isolatedEntityId,
    setIsolatedEntityId,
    measurementMode,
    measurementPoints,
    clearMeasurementPoints,
  } = useUIStore();

  const p1 = measurementPoints[0];
  const p2 = measurementPoints[1];

  const unitStr = useMemo(() => {
    if (!currentWorldState?.metadata.units) return 'm';
    const u = currentWorldState.metadata.units.toLowerCase();
    if (u === 'millimeters' || u === 'mm') return 'mm';
    return 'm';
  }, [currentWorldState]);

  const measurementDistance = useMemo(() => {
    if (!p1 || !p2 || !currentWorldState) return null;
    const distRaw = Math.sqrt(
      Math.pow(p1[0] - p2[0], 2) +
      Math.pow(p1[1] - p2[1], 2) +
      Math.pow(p1[2] - p2[2], 2)
    );
    const scale = currentWorldState.metadata.scale ?? 1.0;
    const distUnits = distRaw / scale;
    return distUnits.toFixed(2);
  }, [p1, p2, currentWorldState]);

  const selectedEntity = selectedEntityId && currentWorldState ? currentWorldState.entities[selectedEntityId] : null;
  const focusedEntity = focusedEntityId && currentWorldState ? currentWorldState.entities[focusedEntityId] : null;
  const isolatedEntity = isolatedEntityId && currentWorldState ? currentWorldState.entities[isolatedEntityId] : null;

  return (
    <div
      className="viewport-hud-grid"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 20,
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, 260px) minmax(320px, 1fr) minmax(180px, 260px)',
        gridTemplateRows: 'auto 1fr auto',
        gap: '12px',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      {/* ── 1. TOP_LEFT ZONE ────────────────────────────────────────────── */}
      <div
        className="hud-zone top-left"
        style={{
          gridColumn: '1',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          pointerEvents: 'auto'
        }}
      >
        <ConfidenceLegendOverlay />
      </div>

      {/* ── 2. TOP_CENTER ZONE ─────────────────────────────────────────── */}
      <div
        className="hud-zone top-center"
        style={{
          gridColumn: '2',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          pointerEvents: 'auto',
          maxWidth: '100%'
        }}
      >
        {/* Spatial Target HUD */}
        {selectedEntity && (
          <div
            style={{
              background: 'rgba(13, 10, 24, 0.92)',
              border: '1px solid var(--vf-violet)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--vf-lavender)',
              boxShadow: '0 0 16px rgba(124, 58, 237, 0.35)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '360px',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--vf-gold-bright)', flexShrink: 0 }}>✦</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
              <div style={{ color: 'var(--vf-gold-soft)', fontWeight: 700, letterSpacing: '0.5px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                SPATIAL TARGET &gt; {selectedEntity.properties.name || selectedEntity.id}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--vf-text-muted)' }}>
                CLASS: {(selectedEntity.semanticClass || 'ENTITY').toUpperCase()} • CONFIDENCE: {Math.round(selectedEntity.confidence * 100)}%
              </div>
            </div>
          </div>
        )}

        {/* Holographic Mode Status HUD */}
        {visualizationMode === 'holo' && (
          <div
            style={{
              background: 'rgba(124, 58, 237, 0.2)',
              border: '1px solid var(--vf-violet)',
              borderRadius: '6px',
              padding: '5px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--vf-lavender)',
              boxShadow: '0 0 16px rgba(124, 58, 237, 0.35)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              whiteSpace: 'nowrap'
            }}
          >
            ✦ HOLOGRAPHIC PROJECTION STABLE
          </div>
        )}

        {/* Target Lock Camera Focus HUD */}
        {focusedEntity && (
          <div
            style={{
              background: 'rgba(23, 20, 38, 0.95)',
              border: '1px solid var(--vf-lavender)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--vf-bright-lavender)',
              boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--vf-gold-bright)' }}>⌖</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <div style={{ color: 'var(--vf-gold-bright)', fontWeight: 700 }}>
                TARGET LOCK &gt; {focusedEntity.properties.name || focusedEntity.id}
              </div>
              <div style={{ fontSize: '8px', color: 'var(--vf-lavender)' }}>
                CAMERA LERPING • TARGET ACQUIRED
              </div>
            </div>
            <button
              onClick={() => setFocusedEntityId(null)}
              style={{
                background: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid var(--vf-violet)',
                borderRadius: '3px',
                color: 'var(--vf-lavender)',
                fontSize: '8px',
                padding: '2px 5px',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
            >
              RELEASE
            </button>
          </div>
        )}

        {/* Isolation Mode HUD */}
        {isolatedEntity && (
          <div
            style={{
              background: 'rgba(212, 175, 106, 0.18)',
              border: '1px solid var(--vf-gold)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--vf-gold-bright)',
              boxShadow: '0 0 16px rgba(212, 175, 106, 0.3)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
          >
            <span>ISOLATION MODE | TARGET: {isolatedEntity.properties.name || isolatedEntity.id}</span>
            <button
              onClick={() => setIsolatedEntityId(null)}
              style={{
                background: 'var(--vf-gold)',
                border: 'none',
                color: '#05040A',
                fontWeight: 700,
                borderRadius: '3px',
                fontSize: '8px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              EXIT ISOLATION
            </button>
          </div>
        )}

        {/* Measurement Workflow Contextual HUD */}
        {measurementMode && (
          <div
            style={{
              background: 'rgba(10, 7, 20, 0.92)',
              border: '1px solid var(--vf-gold)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              color: 'var(--vf-gold-bright)',
              boxShadow: '0 0 16px rgba(212, 175, 106, 0.3)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              whiteSpace: 'nowrap'
            }}
          >
            <span style={{ fontWeight: 700 }}>MEASUREMENT MODE</span>
            {p1 ? (
              p2 ? (
                <span style={{ color: 'var(--vf-gold-soft)' }}>
                  POINT Y LOCKED &gt; DISTANCE CALCULATED
                </span>
              ) : (
                <span style={{ color: 'var(--vf-gold-soft)' }}>
                  POINT X LOCKED [{p1[0].toFixed(3)}, {p1[1].toFixed(3)}, {p1[2].toFixed(3)}] {unitStr} &gt; SELECT POINT Y
                </span>
              )
            ) : (
              <span style={{ color: 'var(--vf-lavender)' }}>POINT X → SELECT FIRST POINT ON 3D SURFACE</span>
            )}
            {p1 && (
              <button
                onClick={() => clearMeasurementPoints()}
                style={{
                  background: 'rgba(212, 175, 106, 0.15)',
                  border: '1px solid var(--vf-gold)',
                  color: 'var(--vf-gold-bright)',
                  fontSize: '8px',
                  borderRadius: '3px',
                  padding: '2px 5px',
                  cursor: 'pointer'
                }}
              >
                RESET
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── 3. TOP_RIGHT ZONE ───────────────────────────────────────────── */}
      <div
        className="hud-zone top-right"
        style={{
          gridColumn: '3',
          gridRow: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}
      >
        <WarningCardsOverlay />
      </div>

      {/* ── 4. CENTER_LEFT ZONE ─────────────────────────────────────────── */}
      <div
        className="hud-zone center-left"
        style={{
          gridColumn: '1',
          gridRow: '2'
        }}
      />

      {/* ── 5. CENTER ZONE (Open 3D Model Area) ────────────────────────── */}
      <div
        className="hud-zone center"
        style={{
          gridColumn: '2',
          gridRow: '2'
        }}
      />

      {/* ── 6. CENTER_RIGHT ZONE (Spatial Tool Rail ViewStudio) ─────────── */}
      <div
        className="hud-zone center-right"
        style={{
          gridColumn: '3',
          gridRow: '2',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <ViewStudio />
      </div>

      {/* ── 7. BOTTOM_LEFT ZONE ─────────────────────────────────────────── */}
      <div
        className="hud-zone bottom-left"
        style={{
          gridColumn: '1',
          gridRow: '3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          pointerEvents: 'auto'
        }}
      >
        <RelationshipOverlayCard />
      </div>

      {/* ── 8. BOTTOM_CENTER ZONE ────────────────────────────────────────── */}
      <div
        className="hud-zone bottom-center"
        style={{
          gridColumn: '2',
          gridRow: '3'
        }}
      />

      {/* ── 9. BOTTOM_RIGHT ZONE (Guaranteed Floating Anchor) ───────────── */}
      {p1 && p2 && measurementDistance && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 35,
            pointerEvents: 'auto',
            background: 'rgba(10, 7, 20, 0.96)',
            border: '1px solid var(--vf-gold)',
            borderRadius: '8px',
            padding: '10px 14px',
            boxShadow: '0 0 24px rgba(212, 175, 106, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--vf-gold-bright)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            width: '260px',
            boxSizing: 'border-box',
            animation: 'fadeIn 250ms cubic-bezier(0.22, 1, 0.36, 1)'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(212, 175, 106, 0.3)',
              paddingBottom: '5px'
            }}
          >
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--vf-gold-bright)' }}>
              ✦ MEASUREMENT RESULT
            </span>
            <button
              onClick={() => clearMeasurementPoints()}
              style={{
                background: 'rgba(212, 175, 106, 0.2)',
                border: '1px solid var(--vf-gold)',
                color: 'var(--vf-gold-bright)',
                fontSize: '8px',
                fontFamily: 'var(--font-mono)',
                borderRadius: '3px',
                padding: '2px 6px',
                cursor: 'pointer'
              }}
            >
              RESET
            </button>
          </div>

          <div style={{ fontSize: '9px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--vf-text-muted)' }}>POINT X:</span>
              <span style={{ color: 'var(--vf-gold-soft)', fontWeight: 600 }}>
                [{p1[0].toFixed(3)}, {p1[1].toFixed(3)}, {p1[2].toFixed(3)}] {unitStr}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--vf-text-muted)' }}>POINT Y:</span>
              <span style={{ color: 'var(--vf-gold-soft)', fontWeight: 600 }}>
                [{p2[0].toFixed(3)}, {p2[1].toFixed(3)}, {p2[2].toFixed(3)}] {unitStr}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(212, 175, 106, 0.25)',
                paddingTop: '5px',
                marginTop: '1px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              <span style={{ color: 'var(--vf-gold-bright)' }}>DISTANCE:</span>
              <span style={{ color: '#FFFFFF', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>{measurementDistance} {unitStr}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewportHUDLayer;
