import type { WorldState } from '../../types/world';
import { DOMAIN_SCHEMAS } from '../../types/semantic';

const defaultClasses = DOMAIN_SCHEMAS.mechanical.defaultClasses;
const semanticClassesMap = defaultClasses.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, any>);

export const mockMechanicalWorld: WorldState = {
  metadata: {
    id: 'mech_gearbox_01',
    name: 'Spur Gear Reducer Assembly',
    domain: 'mechanical',
    units: 'millimeters',
    coordinateSystem: 'y-up',
    scale: 0.001,
  },
  semanticClasses: semanticClassesMap,
  entities: {
    gearbox_housing: {
      id: 'gearbox_housing',
      parentId: null,
      type: 'component',
      semanticClass: 'casing',
      confidence: 0.98,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-100, -80, -100], max: [100, 80, 100] },
      geometry: {
        type: 'box',
        dimensions: { width: 200, height: 160, depth: 200 },
        // BOUNDARY_HELPER: assembly enclosure used for spatial math (camera fit, isolation)
        // but NOT rendered visually by default. Prevents the giant wireframe box overlay.
        geometryRole: 'BOUNDARY_HELPER'
      },
      properties: { name: 'Cast Iron Enclosure', dryWeight: '12.4 kg' },
      annotations: [],
    },
    input_shaft: {
      id: 'input_shaft',
      parentId: 'gearbox_housing',
      type: 'component',
      semanticClass: 'shaft',
      confidence: 0.94,
      transform: { position: [-40, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 1] },
      boundingBox: { min: [-48, -75, -8], max: [-32, 75, 8] },
      geometry: { type: 'cylinder', dimensions: { radius: 10, height: 150 } },
      properties: { diameter: '20 mm', material: '4140 Steel' },
      annotations: [],
    },
    output_shaft: {
      id: 'output_shaft',
      parentId: 'gearbox_housing',
      type: 'component',
      semanticClass: 'shaft',
      confidence: 0.95,
      transform: { position: [40, 0, 0], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 1] },
      boundingBox: { min: [32, -85, -12], max: [48, 85, 12] },
      geometry: { type: 'cylinder', dimensions: { radius: 15, height: 170 } },
      properties: { diameter: '30 mm', material: '4140 Steel' },
      annotations: [],
    },
    gear_driver: {
      id: 'gear_driver',
      parentId: 'input_shaft',
      type: 'component',
      semanticClass: 'gear',
      confidence: 0.92,
      transform: { position: [-40, 10, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-65, 0, -25], max: [-15, 20, 25] },
      geometry: { type: 'cylinder', dimensions: { radius: 25, height: 20 } },
      properties: { teethCount: 20, pitchDiameter: '50 mm', module: 2.5 },
      annotations: [],
    },
    gear_driven: {
      id: 'gear_driven',
      parentId: 'output_shaft',
      type: 'component',
      semanticClass: 'gear',
      confidence: 0.93,
      transform: { position: [40, 10, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [15, 0, -55], max: [65, 20, 55] },
      geometry: { type: 'cylinder', dimensions: { radius: 55, height: 20 } },
      properties: { teethCount: 44, pitchDiameter: '110 mm', module: 2.5 },
      annotations: ['gear_interference_note'],
    },
    bearing_input_top: {
      id: 'bearing_input_top',
      parentId: 'gearbox_housing',
      type: 'component',
      semanticClass: 'bearing',
      confidence: 0.86,
      transform: { position: [-40, 60, 0], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 1] },
      boundingBox: { min: [-46, 54, -16], max: [-34, 66, 16] },
      geometry: { type: 'cylinder', dimensions: { radius: 16, height: 12 } },
      properties: { bearingType: 'Deep Groove Ball', standardCode: '6204' },
      annotations: [],
    },
    bearing_input_bottom: {
      id: 'bearing_input_bottom',
      parentId: 'gearbox_housing',
      type: 'component',
      semanticClass: 'bearing',
      confidence: 0.87,
      transform: { position: [-40, -60, 0], rotation: [0, 0, Math.PI / 2], scale: [1, 1, 1] },
      boundingBox: { min: [-46, -66, -16], max: [-34, -54, 16] },
      geometry: { type: 'cylinder', dimensions: { radius: 16, height: 12 } },
      properties: { bearingType: 'Deep Groove Ball', standardCode: '6204' },
      annotations: [],
    }
  },
  relationships: [
    {
      id: 'rel_gear_mesh',
      source: 'gear_driver',
      target: 'gear_driven',
      type: 'meshes_with',
      properties: { reductionRatio: 2.2 }
    },
    {
      id: 'rel_shaft_gd',
      source: 'input_shaft',
      target: 'gear_driver',
      type: 'supports'
    },
    {
      id: 'rel_shaft_gdn',
      source: 'output_shaft',
      target: 'gear_driven',
      type: 'supports'
    },
    {
      id: 'rel_bear_sh_top',
      source: 'bearing_input_top',
      target: 'input_shaft',
      type: 'supports'
    },
    {
      id: 'rel_bear_sh_bot',
      source: 'bearing_input_bottom',
      target: 'input_shaft',
      type: 'supports'
    }
  ],
  annotations: {
    gear_interference_note: {
      id: 'gear_interference_note',
      entityId: 'gear_driven',
      position: [0, 10, 0],
      text: 'Verify backlash allowance: design specified at 0.12 mm',
      type: 'note',
      author: 'user',
      timestamp: Date.now(),
    }
  }
};
