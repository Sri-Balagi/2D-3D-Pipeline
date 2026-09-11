import { create } from 'zustand';
import type { WorldState, Entity, Annotation, Relationship, ActiveModelInfo, FrontendAIResponse, FrontendPipelineStatus } from '../types/world';

interface WorldStoreState {
  currentWorldState: WorldState | null;
  selectedEntityId: string | null;
  hoveredEntityId: string | null;
  worldSource: 'MOCK' | 'PRESET_GLB' | 'USER_GLB';
  activeModelInfo: ActiveModelInfo | null;
  glbBlobUrl: string | null;
  animatedMeshes: string[];
  animatedOrgan: string | null;
  animationStartTime: number | null;
  
  // Phase 2 states
  commandHistory: FrontendAIResponse[];
  pipelineStatus: FrontendPipelineStatus | null;

  loadWorld: (worldState: WorldState) => void;
  resetWorld: () => void;
  selectEntity: (id: string | null) => void;
  hoverEntity: (id: string | null) => void;
  setWorldSource: (source: 'MOCK' | 'PRESET_GLB' | 'USER_GLB') => void;
  setActiveModelInfo: (info: ActiveModelInfo | null) => void;
  setGlbBlobUrl: (url: string | null) => void;
  setAnimatedMeshes: (meshes: string[], organ: string) => void;
  setAnimationStartTime: (time: number | null) => void;
  addEntity: (entity: Entity) => void;
  removeEntity: (id: string) => void;
  updateEntity: (id: string, updates: Partial<Entity>) => void;
  updateVisualOverrides: (id: string, overrides: Partial<NonNullable<Entity['visualOverrides']>>) => void;
  addRelationship: (rel: Relationship) => void;
  removeRelationship: (id: string) => void;
  addAnnotation: (annotation: Annotation) => void;
  removeAnnotation: (id: string) => void;

  // Phase 2 actions
  addCommandHistoryEntry: (entry: FrontendAIResponse) => void;
  clearCommandHistory: () => void;
  setPipelineStatus: (status: FrontendPipelineStatus | null) => void;
}

export const useWorldStore = create<WorldStoreState>((set) => ({
  currentWorldState: null,
  selectedEntityId: null,
  hoveredEntityId: null,
  worldSource: 'MOCK',
  activeModelInfo: null,
  glbBlobUrl: null,
  animatedMeshes: [],
  animatedOrgan: null,
  animationStartTime: null,
  
  commandHistory: [],
  pipelineStatus: null,

  setAnimatedMeshes: (meshes, organ) => set({ animatedMeshes: meshes, animatedOrgan: organ }),
  setAnimationStartTime: (time) => set({ animationStartTime: time }),

  loadWorld: (worldState) => set({
    currentWorldState: worldState,
    selectedEntityId: null,
    hoveredEntityId: null,
  }),

  resetWorld: () => set((state) => {
    if (state.glbBlobUrl) {
      URL.revokeObjectURL(state.glbBlobUrl);
    }
    return {
      currentWorldState: null,
      selectedEntityId: null,
      hoveredEntityId: null,
      worldSource: 'MOCK',
      activeModelInfo: null,
      glbBlobUrl: null,
      animatedMeshes: [],
      animatedOrgan: null,
      commandHistory: [],
      pipelineStatus: null,
    };
  }),

  setWorldSource: (source) => set({ worldSource: source }),
  setActiveModelInfo: (info) => set({ activeModelInfo: info }),
  setGlbBlobUrl: (url) => set((state) => {
    if (state.glbBlobUrl && state.glbBlobUrl !== url) {
      URL.revokeObjectURL(state.glbBlobUrl);
    }
    return { glbBlobUrl: url };
  }),

  selectEntity: (id) => set({ selectedEntityId: id }),

  hoverEntity: (id) => set({ hoveredEntityId: id }),

  addEntity: (entity) => set((state) => {
    if (!state.currentWorldState) return {};
    return {
      currentWorldState: {
        ...state.currentWorldState,
        entities: {
          ...state.currentWorldState.entities,
          [entity.id]: entity,
        },
      },
    };
  }),

  removeEntity: (id) => set((state) => {
    if (!state.currentWorldState) return {};
    const newEntities = { ...state.currentWorldState.entities };
    delete newEntities[id];

    const newRels = state.currentWorldState.relationships.filter(
      (rel) => rel.source !== id && rel.target !== id
    );

    const newAnnotations = { ...state.currentWorldState.annotations };
    Object.keys(newAnnotations).forEach((annId) => {
      if (newAnnotations[annId].entityId === id) {
        delete newAnnotations[annId];
      }
    });

    return {
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
      hoveredEntityId: state.hoveredEntityId === id ? null : state.hoveredEntityId,
      currentWorldState: {
        ...state.currentWorldState,
        entities: newEntities,
        relationships: newRels,
        annotations: newAnnotations,
      },
    };
  }),

  updateEntity: (id, updates) => set((state) => {
    if (!state.currentWorldState || !state.currentWorldState.entities[id]) return {};
    return {
      currentWorldState: {
        ...state.currentWorldState,
        entities: {
          ...state.currentWorldState.entities,
          [id]: {
            ...state.currentWorldState.entities[id],
            ...updates,
          },
        },
      },
    };
  }),

  updateVisualOverrides: (id, overrides) => set((state) => {
    if (!state.currentWorldState || !state.currentWorldState.entities[id]) return {};
    const prevEntity = state.currentWorldState.entities[id];
    const newOverrides = {
      ...(prevEntity.visualOverrides || {}),
      ...overrides,
    };
    return {
      currentWorldState: {
        ...state.currentWorldState,
        entities: {
          ...state.currentWorldState.entities,
          [id]: {
            ...prevEntity,
            visualOverrides: newOverrides,
          },
        },
      },
    };
  }),

  addRelationship: (rel) => set((state) => {
    if (!state.currentWorldState) return {};
    return {
      currentWorldState: {
        ...state.currentWorldState,
        relationships: [...state.currentWorldState.relationships, rel],
      },
    };
  }),

  removeRelationship: (id) => set((state) => {
    if (!state.currentWorldState) return {};
    return {
      currentWorldState: {
        ...state.currentWorldState,
        relationships: state.currentWorldState.relationships.filter((rel) => rel.id !== id),
      },
    };
  }),

  addAnnotation: (annotation) => set((state) => {
    if (!state.currentWorldState) return {};
    const entityId = annotation.entityId;
    const newEntities = { ...state.currentWorldState.entities };
    if (entityId && newEntities[entityId]) {
      newEntities[entityId] = {
        ...newEntities[entityId],
        annotations: [...(newEntities[entityId].annotations || []), annotation.id],
      };
    }
    return {
      currentWorldState: {
        ...state.currentWorldState,
        entities: newEntities,
        annotations: {
          ...state.currentWorldState.annotations,
          [annotation.id]: annotation,
        },
      },
    };
  }),

  removeAnnotation: (id) => set((state) => {
    if (!state.currentWorldState) return {};
    const annotation = state.currentWorldState.annotations[id];
    const newEntities = { ...state.currentWorldState.entities };
    if (annotation && annotation.entityId && newEntities[annotation.entityId]) {
      newEntities[annotation.entityId] = {
        ...newEntities[annotation.entityId],
        annotations: newEntities[annotation.entityId].annotations.filter((annId) => annId !== id),
      };
    }
    const newAnnotations = { ...state.currentWorldState.annotations };
    delete newAnnotations[id];
    return {
      currentWorldState: {
        ...state.currentWorldState,
        entities: newEntities,
        annotations: newAnnotations,
      },
    };
  }),

  // Phase 2 actions
  addCommandHistoryEntry: (entry) => set((state) => {
    // Keep max 15 commands in history
    const newHistory = [entry, ...state.commandHistory].slice(0, 15);
    return { commandHistory: newHistory };
  }),
  clearCommandHistory: () => set({ commandHistory: [] }),
  setPipelineStatus: (status) => set({ pipelineStatus: status }),
}));
