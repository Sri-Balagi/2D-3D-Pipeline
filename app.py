import gradio as gr
from src.classifier import OrganClassifier
from src.model_retriever import get_3d_model_path
import os

# Initialize the classifier
classifier = OrganClassifier()

import time
from src.mesh_processor import create_dot_meshes

def process_image(image_path):
    if image_path is None:
        yield "No image provided", None
        return
        
    # 1. Classify the 2D image
    predicted_organ = classifier.predict(image_path)
    organ_title = f"Detected Organ: {predicted_organ.title()}"
    
    # Let the UI know what organ was detected immediately
    yield organ_title, None
    
    # 2. Retrieve the 3D model path based on the exact organ name
    model_3d_path = get_3d_model_path(predicted_organ)
    
    if not model_3d_path or not os.path.exists(model_3d_path):
        yield organ_title + " (3D model not found)", None
        return
        
    # 3. Generate the dot mesh stages
    try:
        dot_meshes = create_dot_meshes(model_3d_path, num_stages=5)
    except Exception as e:
        # Fallback if trimesh fails
        print(f"Trimesh error: {e}")
        dot_meshes = [model_3d_path]
        
    # 4. Animate the dot meshes
    # The user requested 20-30 seconds. 5 stages * 4 seconds = 20 seconds.
    # The last yield is the final model.
    for i, mesh_path in enumerate(dot_meshes):
        # We start at 5%, then 20%, 35%, 50%
        is_last = i == len(dot_meshes) - 1
        status_text = organ_title + (" (Generation Complete!)" if is_last else " (Generating 3D Mesh...)")
        yield status_text, mesh_path
        
        if not is_last:
            time.sleep(10)

# Build the Gradio interface
with gr.Blocks(title="2D Image to 3D Organ") as demo:
    gr.Markdown("# 2D Image to 3D Organ Pipeline")
    gr.Markdown("Upload a hand-drawn, animated, or silhouette image of an organ to see its 3D model.")
    
    with gr.Row():
        with gr.Column():
            image_input = gr.Image(type="filepath", label="Upload 2D Image")
            submit_btn = gr.Button("Process")
            
        with gr.Column():
            organ_output = gr.Textbox(label="Detection Result")
            model_output = gr.Model3D(clear_color=[0.0, 0.0, 0.0, 0.0], label="3D Model Viewer")
            
    submit_btn.click(
        fn=process_image,
        inputs=image_input,
        outputs=[organ_output, model_output]
    )

if __name__ == "__main__":
    demo.launch(allowed_paths=[r"E:\Startup\Voxelforge\Dataset\Human_Anatomy\organ_systems\CT dataset (medical)"])
