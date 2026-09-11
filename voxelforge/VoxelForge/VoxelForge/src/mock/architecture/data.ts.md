# data.ts

``typescript
import type { WorldState } from '../../types/world';
import { DOMAIN_SCHEMAS } from '../../types/semantic';

const defaultClasses = DOMAIN_SCHEMAS.architecture.defaultClasses;
const semanticClassesMap = defaultClasses.reduce((acc, curr) => {
  acc[curr.id] = curr;
  return acc;
}, {} as Record<string, any>);

export const mockArchitectureWorld: WorldState = {
  metadata: {
    id: 'arch_house_01',
    name: 'Residential Bungalow Model',
    domain: 'architecture',
    units: 'meters',
    coordinateSystem: 'y-up',
    scale: 1.0,
  },
  semanticClasses: semanticClassesMap,
  entities: {
    building_root: {
      id: 'building_root',
      parentId: null,
      type: 'component',
      semanticClass: 'floor',
      confidence: 0.99,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-6, 0, -6], max: [6, 3, 6] },
      geometry: { type: 'box', dimensions: { width: 12, height: 0.2, depth: 12 } },
      properties: { name: 'Ground Floor Slab', material: 'Reinforced Concrete' },
      annotations: [],
    },
    living_room: {
      id: 'living_room',
      parentId: 'building_root',
      type: 'volume',
      semanticClass: 'room',
      confidence: 0.95,
      transform: { position: [-2.5, 1.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-5, 0, -5], max: [0, 3, 5] },
      geometry: { type: 'box', dimensions: { width: 5, height: 3, depth: 10 } },
      properties: { name: 'Central Living Room', area: '50 m²', floorType: 'Hardwood' },
      annotations: [],
    },
    bedroom: {
      id: 'bedroom',
      parentId: 'building_root',
      type: 'volume',
      semanticClass: 'room',
      confidence: 0.92,
      transform: { position: [2.5, 1.5, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [0, 0, 0], max: [5, 3, 5] },
      geometry: { type: 'box', dimensions: { width: 5, height: 3, depth: 5 } },
      properties: { name: 'Master Bedroom', area: '25 m²', floorType: 'Carpet' },
      annotations: ['bed_ann_01'],
    },
    kitchen: {
      id: 'kitchen',
      parentId: 'building_root',
      type: 'volume',
      semanticClass: 'room',
      confidence: 0.88,
      transform: { position: [2.5, 1.5, -2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [0, 0, -5], max: [5, 3, 0] },
      geometry: { type: 'box', dimensions: { width: 5, height: 3, depth: 5 } },
      properties: { name: 'Open Kitchen', area: '25 m²', floorType: 'Ceramic Tile' },
      annotations: [],
    },
    door_bedroom: {
      id: 'door_bedroom',
      parentId: 'building_root',
      type: 'connector',
      semanticClass: 'door',
      confidence: 0.94,
      transform: { position: [0, 1, 1.5], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-0.1, 0, 1.0], max: [0.1, 2.0, 2.0] },
      geometry: { type: 'box', dimensions: { width: 0.15, height: 2.1, depth: 0.9 } },
      properties: { name: 'Bedroom Entrance Door', width: 0.9, height: 2.1 },
      annotations: [],
    },
    door_kitchen: {
      id: 'door_kitchen',
      parentId: 'building_root',
      type: 'connector',
      semanticClass: 'door',
      confidence: 0.82,
      transform: { position: [0, 1, -1.5], rotation: [0, Math.PI / 2, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-0.1, 0, -2.0], max: [0.1, 2.0, -1.0] },
      geometry: { type: 'box', dimensions: { width: 0.15, height: 2.1, depth: 0.9 } },
      properties: { name: 'Kitchen Archway', width: 0.9, height: 2.1 },
      annotations: ['door_warning_01'],
    },
    window_living_01: {
      id: 'window_living_01',
      parentId: 'building_root',
      type: 'boundary',
      semanticClass: 'window',
      confidence: 0.96,
      transform: { position: [-5, 1.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [-5.1, 0.8, -1], max: [-4.9, 2.2, 1] },
      geometry: { type: 'box', dimensions: { width: 0.2, height: 1.4, depth: 2.0 } },
      properties: { glazing: 'Double Pane', frames: 'Aluminum' },
      annotations: [],
    },
    window_bedroom_01: {
      id: 'window_bedroom_01',
      parentId: 'building_root',
      type: 'boundary',
      semanticClass: 'window',
      confidence: 0.65, // low confidence for testing
      transform: { position: [5, 1.5, 2.5], rotation: [0, 0, 0], scale: [1, 1, 1] },
      boundingBox: { min: [4.9, 0.8, 1.5], max: [5.1, 2.2, 3.5] },
      geometry: { type: 'box', dimensions: { width: 0.2, height: 1.4, depth: 2.0 } },
      properties: { glazing: 'Single Pane', frames: 'Wood' },
      annotations: ['win_conf_warning'],
    }
  },
  relationships: [
    {
      id: 'rel_lr_bd',
      source: 'living_room',
      target: 'bedroom',
      type: 'connected_to',
      properties: { transitVia: 'door_bedroom' }
    },
    {
      id: 'rel_lr_kit',
      source: 'living_room',
      target: 'kitchen',
      type: 'connected_to',
      properties: { transitVia: 'door_kitchen' }
    },
    {
      id: 'rel_slab_lr',
      source: 'building_root',
      target: 'living_room',
      type: 'supports'
    },
    {
      id: 'rel_slab_bd',
      source: 'building_root',
      target: 'bedroom',
      type: 'supports'
    },
    {
      id: 'rel_slab_kit',
      source: 'building_root',
      target: 'kitchen',
      type: 'supports'
    }
  ],
  annotations: {
    bed_ann_01: {
      id: 'bed_ann_01',
      entityId: 'bedroom',
      position: [2.5, 0.1, 2.5],
      text: 'Suggested Queen Bed layout position',
      type: 'note',
      author: 'ai',
      timestamp: Date.now(),
    },
    door_warning_01: {
      id: 'door_warning_01',
      entityId: 'door_kitchen',
      position: [0, 2.2, -1.5],
      text: 'Height clearance warning: structural header required',
      type: 'warning',
      author: 'ai',
      timestamp: Date.now(),
    },
    win_conf_warning: {
      id: 'win_conf_warning',
      entityId: 'window_bedroom_01',
      position: [5, 2.2, 2.5],
      text: 'Low confidence detection: verification needed on site',
      type: 'warning',
      author: 'ai',
      timestamp: Date.now(),
    }
  }
};

``