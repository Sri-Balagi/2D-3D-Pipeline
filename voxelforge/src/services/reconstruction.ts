import type { WorldState } from '../types/world';

export interface ReconstructionProgress {
  step: string;
  percent: number;
}

/**
 * Service contract representing the 2D visual reconstruction pipeline.
 */
export const ReconstructionService = {
  /**
   * Reconstructs 3D geometries and semantic properties from a processed file upload.
   */
  async reconstructWorld(
    _fileId: string,
    onProgress?: (progress: ReconstructionProgress) => void
  ): Promise<WorldState> {
    const steps = [
      { step: 'Aligning blueprint grid coordinates...', percent: 20 },
      { step: 'Resolving wall and opening depths...', percent: 50 },
      { step: 'Generating boundary polygon vectors...', percent: 80 },
      { step: 'Instantiating semantic entities...', percent: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (onProgress) onProgress(step);
    }

    // Return empty fallback representation - actual data loaded from preset in MVP
    throw new Error('Real-time 3D reconstruction requires a GPU pipeline backend connection.');
  }
};
