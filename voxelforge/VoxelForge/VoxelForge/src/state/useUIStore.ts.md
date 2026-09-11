# useUIStore.ts

``typescript
import { create } from 'zustand';

export type VisualizationMode = 
  | 'solid' 
  | 'holo' 
  | 'semantic' 
  | 'x-ray' 
  | 'wireframe' 
  | 'ghost' 
  | 'confidence';

export type CameraMode = 'orbit' | 'isometric' | 'top' | 'front' | 'side';

export type ActivePanel = 'tree' | 'upload' | 'simulation';

interface UIStoreState {
  visualizationMode: VisualizationMode;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  activePanel: ActivePanel;
  cameraMode: CameraMode;
  measurementMode: boolean;
  measurementPoints: [number, number, number][];
  commandPaletteOpen: boolean;
  
  // Clipping plane states
  clipX: number;
  clipY: number;
  clipZ: number;
  clipXActive: boolean;
  clipYActive: boolean;
  clipZActive: boolean;

  // Exploded view slider
  explosionFactor: number;

  setVisualizationMode: (mode: VisualizationMode) => void;
  setLeftSidebarVisible: (visible: boolean) => void;
  setRightSidebarVisible: (visible: boolean) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setCameraMode: (mode: CameraMode) => void;
  setMeasurementMode: (active: boolean) => void;
  addMeasurementPoint: (point: [number, number, number]) => void;
  clearMeasurementPoints: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Clipping controls
  setClipX: (val: number) => void;
  setClipY: (val: number) => void;
  setClipZ: (val: number) => void;
  toggleClipX: (active?: boolean) => void;
  toggleClipY: (active?: boolean) => void;
  toggleClipZ: (active?: boolean) => void;
  resetClipping: () => void;

  setExplosionFactor: (val: number) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  visualizationMode: 'solid',
  leftSidebarVisible: true,
  rightSidebarVisible: true,
  activePanel: 'upload',
  cameraMode: 'orbit',
  measurementMode: false,
  measurementPoints: [],
  commandPaletteOpen: false,

  clipX: 0,
  clipY: 0,
  clipZ: 0,
  clipXActive: false,
  clipYActive: false,
  clipZActive: false,

  explosionFactor: 0,

  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setLeftSidebarVisible: (visible) => set({ leftSidebarVisible: visible }),
  setRightSidebarVisible: (visible) => set({ rightSidebarVisible: visible }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setMeasurementMode: (active) => set((state) => {
    // Clear measurement points when toggling off
    return { 
      measurementMode: active,
      measurementPoints: active ? state.measurementPoints : [],
    };
  }),
  addMeasurementPoint: (point) => set((state) => {
    const points = [...state.measurementPoints, point];
    // Keep max 2 points
    if (points.length > 2) {
      return { measurementPoints: [point] };
    }
    return { measurementPoints: points };
  }),
  clearMeasurementPoints: () => set({ measurementPoints: [] }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  setClipX: (val) => set({ clipX: val }),
  setClipY: (val) => set({ clipY: val }),
  setClipZ: (val) => set({ clipZ: val }),
  
  toggleClipX: (active) => set((state) => ({ clipXActive: active !== undefined ? active : !state.clipXActive })),
  toggleClipY: (active) => set((state) => ({ clipYActive: active !== undefined ? active : !state.clipYActive })),
  toggleClipZ: (active) => set((state) => ({ clipZActive: active !== undefined ? active : !state.clipZActive })),
  
  resetClipping: () => set({
    clipX: 0,
    clipY: 0,
    clipZ: 0,
    clipXActive: false,
    clipYActive: false,
    clipZActive: false,
  }),

  setExplosionFactor: (val) => set({ explosionFactor: val }),
}));

``