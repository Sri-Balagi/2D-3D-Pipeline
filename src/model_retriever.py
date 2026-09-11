import os
import random

def get_3d_model_path(organ_name):
    """
    Given the exact organ name from the classifier, return the path 
    to its corresponding 3D model.
    """
    # Base directory is now local
    base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')
    
    # Map from classifier name to the folder name the user specified
    # User said "lungs are stored in lung-models"
    folder_mapping = {
        "heart": "heart-models",
        "lungs": "lung-models",
        "liver": "liver-models",
        "kidneys": "kidney-models",
        "spleen": "spleen-models",
        "urinary bladder": "urinary_bladder-models",
        "rib cage": "rib_cage-models",
        "spine": "spine-models"
    }
    
    folder_name = folder_mapping.get(organ_name)
    if not folder_name:
        return None
        
    organ_dir = os.path.join(base_dir, folder_name)
    
    if os.path.exists(organ_dir):
        try:
            all_files = os.listdir(organ_dir)
            valid_files = [f for f in all_files if f.endswith(('.glb', '.gltf', '.obj'))]
            
            if valid_files:
                chosen_file = random.choice(valid_files)
                original_path = os.path.join(organ_dir, chosen_file)
                
                # Create a cache directory locally
                cache_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cache')
                os.makedirs(cache_dir, exist_ok=True)
                
                # Use original filename to prevent caching collisions across random picks
                base_filename = os.path.splitext(chosen_file)[0]
                cached_filename = f"{base_filename}.glb"
                cached_path = os.path.join(cache_dir, cached_filename)
                
                # Convert to .glb and save to cache if it's not already there
                import trimesh
                if not os.path.exists(cached_path):
                    try:
                        # force='mesh' prevents returning Scenes with multiple meshes unless needed, 
                        # but for medical .obj it's usually just geometry
                        mesh = trimesh.load(original_path)
                        mesh.export(cached_path)
                    except Exception as e:
                        print(f"Failed to convert mesh to .glb: {e}")
                        # Fallback to pure copy if conversion fails
                        import shutil
                        cached_filename_obj = f"{base_filename}.obj"
                        cached_path_obj = os.path.join(cache_dir, cached_filename_obj)
                        if not os.path.exists(cached_path_obj):
                            shutil.copy2(original_path, cached_path_obj)
                        return cached_path_obj
                
                return cached_path

        except PermissionError:
            print(f"Warning: No permission to read directory {organ_dir}")
            
    # Fallback placeholder if no file found or permission denied
    # We'll return the expected path for a generic file so the UI can at least try to load it
    # or handle the error gracefully.
    expected_file = os.path.join(organ_dir, f"{organ_name}.glb")
    return expected_file
