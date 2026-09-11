# data.ts

``typescript
import type { WorldState } from '../../types/world';
import { DOMAIN_SCHEMAS } from '../../types/semantic';

const defaultClasses = DOMAIN_SCHEMAS.anatomy.defaultClasses;
const semanticClassesMap = defaultClasses.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, any>);

export const mockAnatomyWorld: WorldState = {
  metadata: {
    id: 'anatomy_heart_01',
    name: 'Human Heart Spatial Model',
    domain: 'anatomy',
    units: 'millimeters',
    coordinateSystem: 'y-up',
    scale: 0.001, // 1 mm = 0.001 meters
  },
  semanticClasses: semanticClassesMap,
  entities: {
    heart_root: {
      id: 'heart_root',
      parentId: null,
      type: 'component',
      semanticClass: 'atrium',
      confidence: 0.99,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-60, -80, -60], max: [60, 80, 60] },
      geometry: { type: 'sphere', dimensions: { radius: 80 } },
      properties: { name: 'Myocardium Outer Boundary', estimatedVolume: '280 mL' },
      annotations: [],
    },
    right_atrium: {
      id: 'right_atrium',
      parentId: 'heart_root',
      type: 'volume',
      semanticClass: 'atrium',
      confidence: 0.92,
      transform: { position: [-25, 30, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-45, 10, -20], max: [-5, 50, 20] },
      geometry: { type: 'sphere', dimensions: { radius: 20 } },
      properties: { pressureMean: '4 mmHg', oxygenSaturation: '75%' },
      annotations: [],
    },
    left_atrium: {
      id: 'left_atrium',
      parentId: 'heart_root',
      type: 'volume',
      semanticClass: 'atrium',
      confidence: 0.94,
      transform: { position: [25, 30, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [5, 10, -20], max: [45, 50, 20] },
      geometry: { type: 'sphere', dimensions: { radius: 20 } },
      properties: { pressureMean: '8 mmHg', oxygenSaturation: '98%' },
      annotations: [],
    },
    right_ventricle: {
      id: 'right_ventricle',
      parentId: 'heart_root',
      type: 'volume',
      semanticClass: 'ventricle',
      confidence: 0.91,
      transform: { position: [-20, -20, 10], rotation: [0.1, 0, -0.2], scale: [1, 1, 1] },
      boundingBox: { min: [-45, -50, -15], max: [5, 10, 35] },
      geometry: { type: 'cylinder', dimensions: { radius: 22, height: 50 } },
      properties: { strokeVolume: '70 mL', wallThickness: '4 mm' },
      annotations: [],
    },
    left_ventricle: {
      id: 'left_ventricle',
      parentId: 'heart_root',
      type: 'volume',
      semanticClass: 'ventricle',
      confidence: 0.97,
      transform: { position: [20, -25, -10], rotation: [-0.1, 0, 0.2], scale: [1, 1, 1] },
      boundingBox: { min: [-5, -60, -35], max: [45, 10, 15] },
      geometry: { type: 'cylinder', dimensions: { radius: 25, height: 60 } },
      properties: { strokeVolume: '75 mL', wallThickness: '11 mm', ejectionFraction: '62%' },
      annotations: ['lv_wall_thickening'],
    },
    aorta: {
      id: 'aorta',
      parentId: 'heart_root',
      type: 'connector',
      semanticClass: 'artery',
      confidence: 0.95,
      transform: { position: [15, 60, -10], rotation: [0.3, 0, -0.4], scale: [1, 1, 1] },
      boundingBox: { min: [0, 40, -30], max: [30, 80, 10] },
      geometry: { type: 'cylinder', dimensions: { radius: 12, height: 50 } },
      properties: { diameter: '24 mm', meanVelocity: '20 cm/s' },
      annotations: [],
    },
    valve_mitral: {
      id: 'valve_mitral',
      parentId: 'heart_root',
      type: 'joint',
      semanticClass: 'valve',
      confidence: 0.89,
      transform: { position: [20, 10, -5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [10, 5, -15], max: [30, 15, 5] },
      geometry: { type: 'box', dimensions: { width: 15, height: 2, depth: 15 } },
      properties: { condition: 'Normal', regurgitation: 'None' },
      annotations: [],
    }
  },
  relationships: [
    {
      id: 'rel_la_lv',
      source: 'left_atrium',
      target: 'left_ventricle',
      type: 'flows_to',
      properties: { transitVia: 'valve_mitral' }
    },
    {
      id: 'rel_lv_aorta',
      source: 'left_ventricle',
      target: 'aorta',
      type: 'flows_to'
    },
    {
      id: 'rel_heart_la',
      source: 'heart_root',
      target: 'left_atrium',
      type: 'contains'
    },
    {
      id: 'rel_heart_ra',
      source: 'heart_root',
      target: 'right_atrium',
      type: 'contains'
    },
    {
      id: 'rel_heart_lv',
      source: 'heart_root',
      target: 'left_ventricle',
      type: 'contains'
    },
    {
      id: 'rel_heart_rv',
      source: 'heart_root',
      target: 'right_ventricle',
      type: 'contains'
    }
  ],
  annotations: {
    lv_wall_thickening: {
      id: 'lv_wall_thickening',
      entityId: 'left_ventricle',
      position: [35, -25, -10],
      text: 'Myocardial thickening: typical left ventricular hypertrophy indicator',
      type: 'note',
      author: 'ai',
      timestamp: Date.now(),
    }
  }
};

``