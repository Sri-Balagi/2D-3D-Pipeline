export interface WorldMetadata {
  id: string;
  name: string;
  domain: 'architecture' | 'anatomy' | 'mechanical' | 'electronics' | 'generic';
  units: 'meters' | 'millimeters' | 'micrometers' | 'centimeters';
  coordinateSystem: 'y-up' | 'z-up';
  scale: number; // Conversion factor to meters (e.g. 1.0 for meters, 0.001 for mm)
}

export interface BoundingBox {
  min: [number, number, number];
  max: [number, number, number];
}

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles in radians
  scale: [number, number, number];
}

export interface GeometryData {
  type: 'box' | 'cylinder' | 'sphere' | 'path' | 'mesh';
  glbPath?: string; // Optional path to a GLB/GLTF model
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    radius?: number;
    length?: number;
  };
  points?: [number, number, number][]; // For lines, custom paths, polygons
  /**
   * geometryRole controls whether this entity's geometry is rendered by default:
   *   'MODEL'           — normal semantic entity, always visible
   *   'BOUNDARY_HELPER' — assembly/volume boundary used for spatial math,
   *                       hidden by default, shown only when showDebugBounds is true
   */
  geometryRole?: 'MODEL' | 'BOUNDARY_HELPER';
}

export type EntityType = 'volume' | 'boundary' | 'connector' | 'joint' | 'component' | 'generic';

export interface Entity {
  id: string;
  parentId: string | null;
  type: EntityType;
  semanticClass: string; // references key in semanticClasses
  confidence: number; // between 0.0 and 1.0
  transform: Transform;
  boundingBox: BoundingBox;
  geometry: GeometryData;
  properties: Record<string, string | number | boolean>;
  annotations: string[]; // List of Annotation IDs
  visualOverrides?: {
    color?: string;
    opacity?: number;
    visible?: boolean;
  };
}

export type RelationshipType = 
  | 'connected_to' 
  | 'contains' 
  | 'supports' 
  | 'part_of' 
  | 'meshes_with' 
  | 'flows_to'
  | 'bound_by';

export interface Relationship {
  id: string;
  source: string; // Entity ID
  target: string; // Entity ID
  type: RelationshipType;
  properties?: Record<string, string | number | boolean>;
}

export type AnnotationType = 'warning' | 'note' | 'measurement' | 'ai_explanation';

export interface Annotation {
  id: string;
  entityId?: string; // Optional binding to a specific entity
  position: [number, number, number]; // position in 3D world space
  text: string;
  type: AnnotationType;
  author: 'user' | 'ai';
  timestamp: number;
}

export interface SemanticClassMetadata {
  id: string;
  name: string;
  color: string; // Hex code or RGB
  description: string;
}

export interface WorldState {
  metadata: WorldMetadata;
  entities: Record<string, Entity>; // Keyed by Entity ID
  relationships: Relationship[];
  annotations: Record<string, Annotation>; // Keyed by Annotation ID
  semanticClasses: Record<string, SemanticClassMetadata>; // Keyed by class ID
}

export interface ActiveModelInfo {
  assetId: string;
  filename: string;
  source: 'MOCK' | 'PRESET_GLB' | 'USER_GLB';
  fileType: string;
  fileSize?: number; // in bytes
  dimensions: { width: number; height: number; depth: number };
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  center: [number, number, number];
  nodeCount: number;
  meshCount: number;
  rootNodeName: string;
  units?: string;
}

export interface FrontendPipelineStatus {
  state: 'IDLE' | 'UPLOADING' | 'ANALYZING' | 'DETECTING' | 'UNDERSTANDING' | 'RECONSTRUCTING' | 'VALIDATING' | 'COMPLETE' | 'ERROR';
  progress: number;
  message: string;
  stepDetails?: string;
  source: 'MOCK' | 'BACKEND';
  timestamp: number;
}

export interface FrontendAIResponse {
  id: string;
  prompt: string;
  response: string;
  confidenceScore?: number;
  highlightedEntities: string[];
  suggestedActions: { label: string; action: string }[];
  status: 'executing' | 'success' | 'failed';
  timestamp: number;
}

export interface FrontendComparisonResult {
  deviationRms?: number;
  maxErrorOffset?: [number, number, number];
  volumeOverlapRatio?: number;
  mode: 'SIDE_BY_SIDE' | 'OVERLAY' | 'GHOST' | 'DIFFERENCE';
  opacity: number;
  alignmentOffset: [number, number, number];
  enabled: boolean;
}
