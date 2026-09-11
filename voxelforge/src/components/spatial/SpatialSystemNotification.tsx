import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../state/useUIStore';

export const SpatialSystemNotification: React.FC = () => {
  const notification = useUIStore((state) => state.systemNotification);
  const setSystemNotification = useUIStore((state) => state.setSystemNotification);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) {
      setVisible(false);
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => setSystemNotification(null), 300);
    }, 2400);

    return () => clearTimeout(timer);
  }, [notification, setSystemNotification]);

  if (!notification) return null;

  const isGold = notification.type === 'gold';
  const isWarning = notification.type === 'warning';

  return (
    <div
      style={{
        position: 'absolute',
        top: '64px',
        left: '50%',
        transform: `translateX(-50%) translateY(${visible ? '0px' : '-10px'})`,
        opacity: visible ? 1 : 0,
        transition: 'transform var(--vf-transition-normal), opacity var(--vf-transition-normal)',
        zIndex: 45,
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(23, 20, 38, 0.92)',
          border: `1px solid ${isWarning ? '#be123c' : (isGold ? 'var(--vf-gold)' : 'var(--vf-border-active)')}`,
          borderRadius: '20px',
          boxShadow: isWarning 
            ? '0 4px 20px rgba(190, 18, 60, 0.3)' 
            : (isGold ? '0 4px 20px rgba(212, 175, 106, 0.25)' : '0 4px 20px rgba(124, 58, 237, 0.25)'),
          backdropFilter: 'blur(16px)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: isWarning ? '#DDD6FE' : (isGold ? 'var(--vf-gold-soft)' : 'var(--vf-bright-lavender)'),
          letterSpacing: '0.5px'
        }}
      >
        <span style={{ fontSize: '10px', color: isGold ? 'var(--vf-gold)' : 'var(--vf-soft-violet)' }}>✦</span>
        <span style={{ fontWeight: 600, color: 'var(--vf-text-muted)', fontSize: '9px' }}>VOXEL CORE:</span>
        <span>{notification.message}</span>
      </div>
    </div>
  );
};

export default SpatialSystemNotification;
