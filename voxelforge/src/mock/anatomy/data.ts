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
  entities: {},
  relationships: [],
  annotations: {}
};
