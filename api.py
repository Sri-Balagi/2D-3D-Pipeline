import os
import shutil
from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from src.classifier import OrganClassifier
from src.model_retriever import get_3d_model_path
from src.mesh_processor import create_dot_meshes

app = FastAPI(title="2D-3D API")

# Allow requests from the React frontend (usually localhost:5173 or similar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = OrganClassifier()

# Set up the cache directory for static file serving
cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cache')
os.makedirs(cache_dir, exist_ok=True)
app.mount("/cache", StaticFiles(directory=cache_dir), name="cache")

@app.post("/process")
async def process_image(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        # 1. Classify
        organ = classifier.predict(temp_path)
        
        # 2. Get 3D Model
        model_path = get_3d_model_path(organ)
        if not model_path or not os.path.exists(model_path):
            return {"error": f"Model not found for organ: {organ}", "organ": organ}
        
        # 3. Create dot meshes
        mesh_paths = create_dot_meshes(model_path)
        
        # 4. Convert to URLs
        base_url = "http://localhost:8000/cache"
        mesh_urls = [f"{base_url}/{os.path.basename(p)}" for p in mesh_paths]
        
        return {
            "organ": organ,
            "meshes": mesh_urls
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
