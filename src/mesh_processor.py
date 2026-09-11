import os
import trimesh
import numpy as np

def create_dot_meshes(model_path, num_stages=5):
    """
    Reads a 3D model, extracts its vertices, and generates multiple 
    dot meshes (point clouds) with increasing density.
    Returns a list of file paths to these intermediate meshes.
    """
    # Load the mesh. Some files might contain multiple meshes or scenes.
    scene_or_mesh = trimesh.load(model_path)
    
    if isinstance(scene_or_mesh, trimesh.Scene):
        # If it's a scene, we collect all vertices from all geometries
        vertices = []
        for geom in scene_or_mesh.geometry.values():
            if hasattr(geom, 'vertices'):
                vertices.extend(geom.vertices)
        vertices = np.array(vertices)
    else:
        vertices = scene_or_mesh.vertices
        
    if len(vertices) == 0:
        return [model_path] * num_stages # Fallback if no vertices found

    # Shuffle vertices so subsets look randomly distributed across the surface
    np.random.shuffle(vertices)
    
    cache_dir = os.path.dirname(model_path)
    base_name = os.path.splitext(os.path.basename(model_path))[0]
    
    generated_paths = []
    total_vertices = len(vertices)
    
    # We will use the exact fractions specified
    fractions = [0.0, 0.10, 0.20, 0.30, 0.40]
    
    # We only need num_stages (which is 5 now), so let's adjust
    for i in range(len(fractions)):
        curr_fraction = fractions[i]
        
        if curr_fraction == 0.0:
            subset_size = 1 # Write 1 dummy vertex so the obj parser doesn't crash
        else:
            subset_size = max(100, int(total_vertices * curr_fraction))
        # Ensure we don't exceed total vertices
        subset_size = min(subset_size, total_vertices)
        subset_vertices = vertices[:subset_size]
        
        # Save it as an OBJ point cloud (just 'v' lines)
        out_path = os.path.join(cache_dir, f"{base_name}_dot_{i+1}.obj")
        
        with open(out_path, 'w') as f:
            for v in subset_vertices:
                f.write(f"v {v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
                
        generated_paths.append(out_path)
        
    return generated_paths
