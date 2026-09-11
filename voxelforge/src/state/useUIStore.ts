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

  // Phase 2 Advanced Spatial UX states
  focusedEntityId: string | null;
  isolatedEntityId: string | null;
  filteredSemanticClasses: string[];
  showRelationships: boolean;
  showRelationshipLabels: boolean;
  selectedRelationshipId: string | null;
  lowConfidenceFilterActive: boolean;
  splitViewActive: boolean;
  comparisonActive: boolean;
  comparisonMode: 'SIDE_BY_SIDE' | 'OVERLAY' | 'GHOST' | 'DIFFERENCE';
  comparisonOpacity: number;
  alignmentOffset: [number, number, number];
  annotationModeActive: boolean;
  // Debug / Developer toggles
  showDebugBounds: boolean;

  // Phase 4 Spatial AI OS states
  spatialBootState: 'BOOTING' | 'READY';
  holoTransitionState: 'IDLE' | 'SCANNING' | 'BUILDING' | 'STABLE';
  spatialSystemState: 'IDLE' | 'ANALYZING' | 'PROCESSING' | 'READY' | 'ERROR';
  systemNotification: { message: string; type?: 'info' | 'success' | 'gold' | 'warning' } | null;

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

  // Setters for Phase 2 & 3 & 4
  setFocusedEntityId: (id: string | null) => void;
  setIsolatedEntityId: (id: string | null) => void;
  toggleSemanticClassFilter: (classId: string) => void;
  clearSemanticClassFilters: () => void;
  setShowRelationships: (show: boolean) => void;
  setShowRelationshipLabels: (show: boolean) => void;
  setSelectedRelationshipId: (id: string | null) => void;
  setLowConfidenceFilterActive: (active: boolean) => void;
  setSplitViewActive: (active: boolean) => void;
  setComparisonActive: (active: boolean) => void;
  setComparisonMode: (mode: 'SIDE_BY_SIDE' | 'OVERLAY' | 'GHOST' | 'DIFFERENCE') => void;
  setComparisonOpacity: (opacity: number) => void;
  setAlignmentOffset: (offset: [number, number, number]) => void;
  setAnnotationModeActive: (active: boolean) => void;
  setShowDebugBounds: (show: boolean) => void;

  // Phase 4 Setters
  setSpatialBootState: (state: 'BOOTING' | 'READY') => void;
  setHoloTransitionState: (state: 'IDLE' | 'SCANNING' | 'BUILDING' | 'STABLE') => void;
  setSpatialSystemState: (state: 'IDLE' | 'ANALYZING' | 'PROCESSING' | 'READY' | 'ERROR') => void;
  setSystemNotification: (notification: { message: string; type?: 'info' | 'success' | 'gold' | 'warning' } | null) => void;
  notifySystemAction: (message: string, type?: 'info' | 'success' | 'gold' | 'warning') => void;
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

  // Default values for Phase 2
  focusedEntityId: null,
  isolatedEntityId: null,
  filteredSemanticClasses: [],
  showRelationships: false,
  showRelationshipLabels: false,
  selectedRelationshipId: null,
  lowConfidenceFilterActive: false,
  splitViewActive: false,
  comparisonActive: false,
  comparisonMode: 'OVERLAY',
  comparisonOpacity: 0.5,
  alignmentOffset: [0, 0, 0],
  annotationModeActive: false,
  showDebugBounds: false, // BOUNDARY_HELPER entities hidden by default

  // Phase 4 initial values
  spatialBootState: 'BOOTING',
  holoTransitionState: 'IDLE',
  spatialSystemState: 'READY',
  systemNotification: null,

  setVisualizationMode: (mode) => {
    set({ visualizationMode: mode });
    if (mode === 'holo') {
      set({ holoTransitionState: 'SCANNING' });
      setTimeout(() => set({ holoTransitionState: 'BUILDING' }), 400);
      setTimeout(() => {
        set({ holoTransitionState: 'STABLE' });
        set({ systemNotification: { message: 'Holographic projection stabilized.', type: 'info' } });
      }, 900);
    } else if (mode === 'semantic') {
      set({ systemNotification: { message: 'Semantic structure mapped.', type: 'info' } });
    } else if (mode === 'solid') {
      set({ systemNotification: { message: 'Surface geometry restored.', type: 'info' } });
    }
  },
  setLeftSidebarVisible: (visible) => set({ leftSidebarVisible: visible }),
  setRightSidebarVisible: (visible) => set({ rightSidebarVisible: visible }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setMeasurementMode: (active) => {
    set((state) => ({ 
      measurementMode: active,
      measurementPoints: active ? state.measurementPoints : [],
    }));
    if (active) {
      set({ systemNotification: { message: 'Measurement mode active. Select point X.', type: 'gold' } });
    }
  },
  addMeasurementPoint: (point) => set((state) => {
    const points = [...state.measurementPoints, point];
    if (points.length === 1) {
      return { 
        measurementPoints: points,
        systemNotification: { message: 'Point X locked. Select point Y.', type: 'gold' }
      };
    } else if (points.length === 2) {
      return { 
        measurementPoints: points,
        systemNotification: { message: 'Point Y locked. Distance calculated.', type: 'gold' }
      };
    } else {
      return { 
        measurementPoints: [point],
        systemNotification: { message: 'Point X locked. Select point Y.', type: 'gold' }
      };
    }
  }),
  clearMeasurementPoints: () => set({ 
    measurementPoints: [],
    systemNotification: { message: 'Measurement points cleared. Select point X.', type: 'gold' }
  }),
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

  // Setters for Phase 2 & 3 & 4
  setFocusedEntityId: (id) => {
    set({ focusedEntityId: id });
    if (id) {
      set({ systemNotification: { message: 'Spatial target acquired.', type: 'info' } });
    }
  },
  setIsolatedEntityId: (id) => {
    set({ isolatedEntityId: id });
    if (id) {
      set({ systemNotification: { message: 'Entity isolation active.', type: 'info' } });
    } else {
      set({ systemNotification: { message: 'Isolation deactivated.', type: 'info' } });
    }
  },
  toggleSemanticClassFilter: (classId) => set((state) => {
    const isFiltered = state.filteredSemanticClasses.includes(classId);
    return {
      filteredSemanticClasses: isFiltered
        ? state.filteredSemanticClasses.filter(c => c !== classId)
        : [...state.filteredSemanticClasses, classId]
    };
  }),
  clearSemanticClassFilters: () => set({ filteredSemanticClasses: [] }),
  setShowRelationships: (show) => {
    set({ showRelationships: show });
    if (show) {
      set({ systemNotification: { message: 'Spatial data connections active.', type: 'info' } });
    }
  },
  setShowRelationshipLabels: (show) => set({ showRelationshipLabels: show }),
  setSelectedRelationshipId: (id) => set({ selectedRelationshipId: id }),
  setLowConfidenceFilterActive: (active) => set({ lowConfidenceFilterActive: active }),
  setSplitViewActive: (active) => set({ splitViewActive: active }),
  setComparisonActive: (active) => set({ comparisonActive: active }),
  setComparisonMode: (mode) => set({ comparisonMode: mode }),
  setComparisonOpacity: (opacity) => set({ comparisonOpacity: opacity }),
  setAlignmentOffset: (offset) => set({ alignmentOffset: offset }),
  setAnnotationModeActive: (active) => set({ annotationModeActive: active }),
  setShowDebugBounds: (show) => set({ showDebugBounds: show }),

  // Phase 4 Setters
  setSpatialBootState: (state) => set({ spatialBootState: state }),
  setHoloTransitionState: (state) => set({ holoTransitionState: state }),
  setSpatialSystemState: (state) => set({ spatialSystemState: state }),
  setSystemNotification: (notification) => set({ systemNotification: notification }),
  notifySystemAction: (message, type = 'info') => set({ systemNotification: { message, type } }),
}));
