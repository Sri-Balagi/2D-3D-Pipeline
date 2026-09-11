# Voxel Forge - Phase 1 Implementation Assessment

## 1. Current Project State
- **Workspace Directory**: `p:/VoxelForge` (Absolute path: `P:\VoxelForge`)
- **Existing Files**: None (The directory is currently empty).
- **Vite/React/TypeScript**: Not yet initialized.
- **Dependencies**: None.

## 2. Existing Useful Components
- None, starting from scratch.

## 3. Required Dependencies (To Be Installed)
We need to set up a modern 3D web application stack. We will install:
- **Core**: `react`, `react-dom`
- **Build / TS**: `typescript`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`
- **State Management**: `zustand`
- **3D Renderers**: `three`, `@types/three`, `@react-three/fiber`, `@react-three/drei`
- **Icons**: `lucide-react`
- **Styling**: Vanilla CSS (CSS Variables, high-tech IDE layout)

## 4. Architecture Risks
- **3D Viewer Canvas Lifecycle**: R3F canvas must handle viewport resize and clean up Three.js materials properly to avoid memory leaks.
- **State Synchronization**: Maintaining clean, decoupled boundaries between Zustand stores (World, UI, Simulation) to ensure the renderer doesn't side-effectfully modify semantic state.
- **GLB Asset Loading Fallback**: If an external GLB is missing, the system must gracefully fall back to procedurally generated geometry so that the application is fully functional.

## 5. Files to Be Reused
- None.

## 6. Files to Be Created / Modified
We will set up the workspace in the following structure:
- `package.json` (initialized via Vite)
- `tsconfig.json`, `vite.config.ts`
- `src/main.tsx`, `src/App.tsx`, `src/index.css`
- `src/types/world.ts` - Canonical domain-agnostic world model
- `src/types/semantic.ts` - Semantic class and confidence models
- `src/state/useWorldStore.ts` - Canonical WorldState store
- `src/state/useUIStore.ts` - Panel layout, view studio modes, overlays
- `src/state/useSimulationStore.ts` - Independent simulation timer & metric trackers
- `src/utils/geometryFactory.ts` - Procedural mesh generator fallback
- `src/components/viewer/Viewport.tsx` - Three.js/R3F rendering scene
- `src/components/world/WorldTree.tsx` - Hierarchical node list
- `src/components/inspector/Inspector.tsx` - Component details & relationship inspector
- `src/components/visualization/ViewStudio.tsx` - View mode select
- `src/components/ai/CommandBar.tsx` - Mock natural language interpreter
- `src/components/upload/UploadPanel.tsx` - Mock file upload interface
- `src/services/api.ts` - API contract interfaces for perception and reconstruction
- `src/mock/` - Data sets for Architecture, Anatomy, and Mechanical worlds
