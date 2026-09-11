import type { SemanticClassMetadata, WorldMetadata } from './world';

export interface DomainSchema {
  domain: WorldMetadata['domain'];
  displayName: string;
  defaultClasses: SemanticClassMetadata[];
  supportedSimulations: {
    id: string;
    name: string;
    description: string;
  }[];
}

export const DOMAIN_SCHEMAS: Record<WorldMetadata['domain'], DomainSchema> = {
  architecture: {
    domain: 'architecture',
    displayName: 'Architecture & Construction',
    defaultClasses: [
      { id: 'room', name: 'Room Space', color: '#3b82f6', description: 'Internal functional rooms/spaces' },
      { id: 'wall', name: 'Wall Boundary', color: '#9ca3af', description: 'Structural walls' },
      { id: 'door', name: 'Doorway', color: '#f59e0b', description: 'Access portal between spaces' },
      { id: 'window', name: 'Window', color: '#a78bfa', description: 'Translucent wall openings' },
      { id: 'floor', name: 'Floor Slab', color: '#4b5563', description: 'Floor base elements' },
    ],
    supportedSimulations: [
      { id: 'evacuation', name: 'Evacuation Simulation', description: 'Calculates crowd escape pathfinding times and bottlenecks.' },
      { id: 'navigation', name: 'Navigation / Pathfinding', description: 'Finds accessibility paths between different zones.' }
    ]
  },
  anatomy: {
    domain: 'anatomy',
    displayName: 'Anatomical Structure',
    defaultClasses: [
      { id: 'atrium', name: 'Atrium', color: '#ef4444', description: 'Upper chamber of the heart' },
      { id: 'ventricle', name: 'Ventricle', color: '#dc2626', description: 'Lower chamber of the heart' },
      { id: 'artery', name: 'Arterial Vessel', color: '#f87171', description: 'Vessel carrying oxygenated blood' },
      { id: 'vein', name: 'Venous Vessel', color: '#2563eb', description: 'Vessel carrying deoxygenated blood' },
      { id: 'valve', name: 'Cardiac Valve', color: '#eab308', description: 'Valves regulating chamber flow' }
    ],
    supportedSimulations: [
      { id: 'blood_flow', name: 'Hemodynamics Simulation', description: 'Simulates pressure and flow rate velocities through chambers.' }
    ]
  },
  mechanical: {
    domain: 'mechanical',
    displayName: 'Mechanical Engineering',
    defaultClasses: [
      { id: 'gear', name: 'Gear Element', color: '#f97316', description: 'Rotating cogwheel transmitting torque' },
      { id: 'shaft', name: 'Rotational Shaft', color: '#84cc16', description: 'Central axle core' },
      { id: 'bearing', name: 'Bearing Support', color: '#a855f7', description: 'Friction-reducing shaft support' },
      { id: 'casing', name: 'Enclosure Casing', color: '#6b7280', description: 'Outer structural protective cover' }
    ],
    supportedSimulations: [
      { id: 'rotational_motion', name: 'Kinematic Simulation', description: 'Simulates angular velocity, gear tooth interactions, and friction.' },
      { id: 'stress_analysis', name: 'Structural Stress Analysis', description: 'Simulates mechanical load and load dissipation profiles.' }
    ]
  },
  electronics: {
    domain: 'electronics',
    displayName: 'Electronics & PCBs',
    defaultClasses: [
      { id: 'substrate', name: 'Substrate FR4', color: '#059669', description: 'PCB non-conductive board' },
      { id: 'trace', name: 'Copper Trace', color: '#f59e0b', description: 'Conductive routing path' },
      { id: 'microchip', name: 'IC Chip', color: '#111827', description: 'Active integrated circuit microchip' },
      { id: 'capacitor', name: 'Capacitor', color: '#d97706', description: 'Passive charge storage component' },
      { id: 'resistor', name: 'Resistor', color: '#b91c1c', description: 'Current limiting component' }
    ],
    supportedSimulations: [
      { id: 'thermal_dissipation', name: 'Thermal Dissipation', description: 'Simulates heat maps based on component power dissipation.' },
      { id: 'signal_propagation', name: 'Signal Integrity', description: 'Simulates high-speed signal trace propagation delay and noise.' }
    ]
  },
  generic: {
    domain: 'generic',
    displayName: 'Generic Spatial Workspace',
    defaultClasses: [
      { id: 'node', name: 'Spatial Node', color: '#10b981', description: 'Generic entity node' },
      { id: 'link', name: 'Spatial Connection', color: '#6366f1', description: 'Generic link connector' }
    ],
    supportedSimulations: []
  }
};
