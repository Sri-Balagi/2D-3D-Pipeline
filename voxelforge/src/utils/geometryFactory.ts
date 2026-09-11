import * as THREE from 'three';
import type { GeometryData } from '../types/world';

export interface R3FGeometryProps {
  type: GeometryData['type'];
  args: any[];
  points?: THREE.Vector3[];
}

/**
 * Maps our canonical GeometryData to argument lists suitable for React Three Fiber geometry components.
 */
export function getGeometryProps(geom: GeometryData): R3FGeometryProps {
  switch (geom.type) {
    case 'box': {
      const w = geom.dimensions?.width ?? 1;
      const h = geom.dimensions?.height ?? 1;
      const d = geom.dimensions?.depth ?? 1;
      return {
        type: 'box',
        args: [w, h, d]
      };
    }
    case 'cylinder': {
      const r = geom.dimensions?.radius ?? 0.5;
      const h = geom.dimensions?.height ?? 1;
      return {
        type: 'cylinder',
        args: [r, r, h, 32] // radiusTop, radiusBottom, height, radialSegments
      };
    }
    case 'sphere': {
      const r = geom.dimensions?.radius ?? 0.5;
      return {
        type: 'sphere',
        args: [r, 32, 32] // radius, widthSegments, heightSegments
      };
    }
    case 'path': {
      const pts = geom.points?.map(p => new THREE.Vector3(p[0], p[1], p[2])) ?? [];
      return {
        type: 'path',
        args: [],
        points: pts
      };
    }
    case 'mesh':
    default: {
      return {
        type: 'mesh',
        args: []
      };
    }
  }
}
