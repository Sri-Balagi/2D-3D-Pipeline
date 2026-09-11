import * as THREE from 'three';
import type { ActiveModelInfo } from '../types/world';

export const AssetLoaderService = {
  /**
   * Validates if a file is a valid GLB or GLTF asset.
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (extension === '.png' || extension === '.jpg' || extension === '.jpeg') {
      return { valid: true };
    }
    
    if (extension === '.glb') {
      return { valid: true };
    }
    
    if (extension === '.gltf') {
      return { 
        valid: true, 
        error: 'GLTF warning: Multi-file GLTF (referencing external .bin or textures) may fail to load from a single file upload. GLB is highly recommended.' 
      };
    }
    
    return { 
      valid: false, 
      error: 'Unsupported format. Voxel Forge currently expects .png, .jpg, or standard .glb assets for this pipeline.' 
    };
  },

  /**
   * Parses loaded GLTF scene assets and extracts serializable metadata.
   * Assures NO Three.js runtime classes are leaked into Zustand.
   */
  parseModelMetadata(
    gltfScene: THREE.Object3D,
    filename: string,
    source: 'MOCK' | 'PRESET_GLB' | 'USER_GLB',
    fileSize?: number
  ): ActiveModelInfo {
    let nodeCount = 0;
    let meshCount = 0;

    // 1. Traverse hierarchy and gather counters
    gltfScene.traverse((node) => {
      nodeCount++;
      if ((node as any).isMesh) {
        meshCount++;
      }
    });

    // 2. Compute physical bounding box
    const box = new THREE.Box3().setFromObject(gltfScene);
    const centerVec = new THREE.Vector3();
    const sizeVec = new THREE.Vector3();
    box.getCenter(centerVec);
    box.getSize(sizeVec);

    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    const fileType = extension === '.glb' ? 'GLB (Binary)' : 'GLTF (JSON)';

    return {
      assetId: `asset_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      source,
      fileType,
      fileSize,
      dimensions: {
        width: sizeVec.x,
        height: sizeVec.y,
        depth: sizeVec.z,
      },
      boundingBox: {
        min: [box.min.x, box.min.y, box.min.z],
        max: [box.max.x, box.max.y, box.max.z],
      },
      center: [centerVec.x, centerVec.y, centerVec.z],
      nodeCount,
      meshCount,
      rootNodeName: gltfScene.name || 'Scene Root',
      units: undefined // Default to none, can be resolved at runtime by domain metadata
    };
  }
};
export default AssetLoaderService;
