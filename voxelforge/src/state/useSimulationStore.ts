import { create } from 'zustand';

export type SimulationStatus = 'idle' | 'playing' | 'paused' | 'stopped';

export interface SimEntityState {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  properties?: Record<string, string | number | boolean>;
  color?: string;
}

export interface SimEvent {
  id: string;
  time: number; // Simulation time in seconds
  type: 'info' | 'warning' | 'critical' | 'success';
  description: string;
  entityId?: string;
}

interface SimulationStoreState {
  simulationStatus: SimulationStatus;
  currentTime: number; // in seconds
  duration: number; // total simulation duration
  speed: number; // multiplier e.g. 0.5, 1, 2, 4
  activeScenario: string | null;
  entitySimulationStates: Record<string, SimEntityState>;
  metrics: Record<string, number | string>;
  events: SimEvent[];

  setSimulationStatus: (status: SimulationStatus) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (dur: number) => void;
  setSpeed: (speed: number) => void;
  setActiveScenario: (scenario: string | null) => void;
  setEntitySimState: (entityId: string, state: SimEntityState) => void;
  setMetrics: (metrics: Record<string, number | string>) => void;
  addEvent: (event: SimEvent) => void;
  resetSimulation: () => void;
}

export const useSimulationStore = create<SimulationStoreState>((set) => ({
  simulationStatus: 'idle',
  currentTime: 0,
  duration: 60, // 60 seconds default
  speed: 1,
  activeScenario: null,
  entitySimulationStates: {},
  metrics: {},
  events: [],

  setSimulationStatus: (status) => set({ simulationStatus: status }),
  setCurrentTime: (time) => set((state) => ({ currentTime: Math.max(0, Math.min(state.duration, time)) })),
  setDuration: (dur) => set({ duration: dur }),
  setSpeed: (speed) => set({ speed }),
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setEntitySimState: (entityId, entityState) => set((state) => ({
    entitySimulationStates: {
      ...state.entitySimulationStates,
      [entityId]: {
        ...(state.entitySimulationStates[entityId] || {}),
        ...entityState,
      },
    },
  })),
  setMetrics: (metrics) => set({ metrics }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event].sort((a, b) => a.time - b.time) })),
  resetSimulation: () => set({
    simulationStatus: 'idle',
    currentTime: 0,
    entitySimulationStates: {},
    metrics: {},
    events: [],
  }),
}));
