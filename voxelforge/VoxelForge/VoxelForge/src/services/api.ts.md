# api.ts

``typescript
import type { WorldState } from '../types/world';

export interface UploadResponse {
  fileId: string;
  fileName: string;
  detectedDomain: 'architecture' | 'anatomy' | 'mechanical' | 'electronics' | 'generic';
  confidence: number;
  description: string;
  timestamp: number;
}

export interface ExplainResponse {
  entityId: string;
  explanation: string;
  confidence: number;
}

/**
 * Service representing future API endpoints for the perception and AI backend.
 */
export const ApiService = {
  /**
   * Uploads a 2D drawing/MRI and parses domain details.
   */
  async uploadInput(file: File): Promise<UploadResponse> {
    // Simulated delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    return {
      fileId: `file_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      detectedDomain: 'architecture', // Mock fallback
      confidence: 0.945,
      description: 'Simulated blueprint image containing structural outlines.',
      timestamp: Date.now(),
    };
  },

  /**
   * Explains a specific selected entity in the current spatial layout.
   */
  async explainEntity(entityId: string, worldState: WorldState): Promise<ExplainResponse> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const entity = worldState.entities[entityId];
    const name = entity?.properties.name || entityId;
    
    return {
      entityId,
      explanation: `This is a reconstructed '${entity?.semanticClass}' labeled '${name}'. It represents a '${entity?.type}' volume structure in the domain layout.`,
      confidence: entity?.confidence ?? 0.9,
    };
  }
};

``