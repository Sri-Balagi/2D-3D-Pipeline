import React from 'react';
import { useWorldStore } from '../../state/useWorldStore';

export const ConfidenceLegendOverlay: React.FC = () => {
  const currentWorldState = useWorldStore((state) => state.currentWorldState);

  if (!currentWorldState) return null;

  return null;
};

export default ConfidenceLegendOverlay;
