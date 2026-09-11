# 2D-3D Spatial Anatomy Pipeline

A self-contained AI-powered pipeline that classifies a 2D medical/anatomical image and progressively renders the corresponding 3D organ model in an interactive 3D viewer.

## How It Works

1. Upload a 2D image of a human organ (heart, lungs, liver, kidneys, spleen, urinary bladder, rib cage, spine).
2. Press **Process Input**. OpenCLIP classifies the organ.
3. The matching 3D model (randomly selected from 5 variants per organ) is loaded in the viewer.
4. The model progressively builds its mesh from 0% to 40% density over 40 seconds.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + React Three Fiber + Vite |
| Backend | FastAPI + Python |
| AI Classifier | OpenCLIP (ViT-B-32, laion2b_s34b_b79k) |
| 3D Processing | trimesh + numpy |
| State Management | Zustand |

## Project Structure

`
2D-3D/
├── api.py                  # FastAPI backend entry point
├── requirements.txt        # Python dependencies
├── models/                 # Self-contained local 3D models (5 per organ)
│   ├── heart-models/
│   ├── lung-models/
│   ├── liver-models/
│   ├── kidney-models/
│   ├── spleen-models/
│   ├── urinary_bladder-models/
│   ├── rib_cage-models/
│   └── spine-models/
├── src/
│   ├── classifier.py       # OpenCLIP organ classifier
│   ├── model_retriever.py  # Random model selector from local models/
│   └── mesh_processor.py   # Generates dot-mesh .obj files at varying densities
└── voxelforge/             # React frontend
`

## Setup and Running

### 1. Backend
`
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python api.py
`
Backend runs at: http://localhost:8000

### 2. Frontend
`
cd voxelforge
npm install
npm run dev
`
Frontend runs at: http://localhost:5173
