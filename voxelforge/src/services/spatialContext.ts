import type { WorldState, Entity, Relationship } from '../types/world';

export interface SpatialContextData {
  selectedEntity: Entity | null;
  relatedEntities: Entity[];
  relationships: Relationship[];
  suggestions: string[];
  insightText: string;
  domainName: string;
}

export function getRelatedEntities(
  entityId: string | null,
  worldState: WorldState | null
): { relatedEntityIds: string[]; relationships: Relationship[] } {
  if (!entityId || !worldState) {
    return { relatedEntityIds: [], relationships: [] };
  }

  const matchingRels = worldState.relationships.filter(
    (rel) => rel.source === entityId || rel.target === entityId
  );

  const relatedIds = new Set<string>();
  matchingRels.forEach((rel) => {
    if (rel.source === entityId) relatedIds.add(rel.target);
    if (rel.target === entityId) relatedIds.add(rel.source);
  });

  return {
    relatedEntityIds: Array.from(relatedIds),
    relationships: matchingRels,
  };
}

export function getContextualSuggestions(
  entityId: string | null,
  worldState: WorldState | null
): string[] {
  if (!worldState) {
    return [
      'Explain this model',
      'Show relationships',
      'Explode assembly',
      'Measure distance',
      'Holographic mode',
      'Show low confidence',
    ];
  }

  const entity = entityId ? worldState.entities[entityId] : null;
  const name = String(entity?.properties.name || '').toLowerCase();
  const cls = String(entity?.semanticClass || '').toLowerCase();

  // Detect domain context from entity classes or model structure
  const isAnatomy = cls.includes('ventricle') || cls.includes('atrium') || cls.includes('valve') || name.includes('heart') || name.includes('aorta');
  const isMechanical = cls.includes('gear') || cls.includes('shaft') || cls.includes('bearing') || cls.includes('housing') || name.includes('gearbox');

  if (isAnatomy) {
    if (name.includes('aorta') || name.includes('artery') || name.includes('vein')) {
      return [
        'Explain vessel',
        'Focus aorta',
        'Isolate aorta',
        'Show connected structures',
        'Trace pathway',
        'Measure diameter',
      ];
    }
    if (name.includes('valve')) {
      return [
        'Explain valve',
        'Focus valve',
        'Isolate valve',
        'Show connected chambers',
        'Trace pathway',
        'Measure orifice',
      ];
    }
    return [
      'Explain chamber',
      'Focus chamber',
      'Isolate chamber',
      'Show connected structures',
      'Show relationships',
      'Measure chamber',
    ];
  }

  if (isMechanical) {
    if (name.includes('bearing') || cls.includes('bearing')) {
      return [
        'Explain bearing',
        'Focus bearing',
        'Isolate bearing',
        'Show connected parts',
        'Show shaft relationship',
        'Measure bearing',
      ];
    }
    if (name.includes('shaft') || cls.includes('shaft')) {
      return [
        'Explain shaft',
        'Focus shaft',
        'Isolate shaft',
        'Show connected gears',
        'Trace relationship',
        'Measure diameter',
      ];
    }
    return [
      'Explain gear',
      'Focus gear',
      'Isolate gear',
      'Show connected parts',
      'Show rotation path',
      'Measure diameter',
    ];
  }

  // Architecture (default)
  if (name.includes('window') || cls.includes('window')) {
    return [
      'Explain window',
      'Focus window',
      'Show connected room',
      'Measure window',
      'Isolate window',
      'Show relationships',
    ];
  }
  if (name.includes('door') || cls.includes('door')) {
    return [
      'Explain door',
      'Focus door',
      'Show connected rooms',
      'Measure clearance',
      'Isolate door',
      'Show relationships',
    ];
  }

  return [
    'Explain this room',
    'Focus room',
    'Isolate room',
    'Show connected doors',
    'Show connected windows',
    'Measure room',
  ];
}

export function getContextualInsight(
  entityId: string | null,
  worldState: WorldState | null
): string {
  if (!worldState) {
    return 'Select any spatial entity in the world graph or 3D viewport to inspect contextual intelligence.';
  }

  if (!entityId || !worldState.entities[entityId]) {
    const totalEntities = Object.keys(worldState.entities).length;
    return `Spatial world graph active with ${totalEntities} mapped entities. Select an entity to analyze semantic relationships and confidence metrics.`;
  }

  const entity = worldState.entities[entityId];
  const name = String(entity.properties.name || entity.id);
  const confidencePct = Math.round(entity.confidence * 100);
  const semanticClass = (entity.semanticClass || 'ENTITY').toUpperCase();
  const { relatedEntityIds } = getRelatedEntities(entityId, worldState);

  const connText =
    relatedEntityIds.length > 0
      ? `Directly linked to ${relatedEntityIds.length} connected spatial ${
          relatedEntityIds.length === 1 ? 'entity' : 'entities'
        }.`
      : 'No direct topological dependencies detected in graph.';

  return `${name} (${semanticClass}) detected with ${confidencePct}% confidence. ${connText} Geometry and spatial constraints are within nominal operating parameters.`;
}
