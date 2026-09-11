# UploadPanel.tsx

```tsx
import React, { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { AssetLoaderService } from '../../services/modelLoader';
import { DOMAIN_SCHEMAS } from '../../types/semantic';
import type { WorldState } from '../../types/world';
import { UploadCloud, CheckCircle2, Cpu, Eye, AlertTriangle } from 'lucide-react';
import { mockArchitectureWorld } from '../../mock/architecture/data';
import { mockAnatomyWorld } from '../../mock/anatomy/data';
import { mockMechanicalWorld } from '../../mock/mechanical/data';

interface DetectedDetails {
  domain: 'architecture' | 'anatomy' | 'mechanical' | 'electronics' | 'generic';
  typeLabel: string;
  confidence: number;
  description: string;
  worldData: WorldState;
  isGlb: boolean;
}

export const UploadPanel: React.FC = () => {
  const loadWorld = useWorldStore((state) => state.loadWorld);
  const setWorldSource = useWorldStore((state) => state.setWorldSource);
  const setGlbBlobUrl = useWorldStore((state) => state.setGlbBlobUrl);
  const glbBlobUrl = useWorldStore((state) => state.glbBlobUrl);
  const resetWorld = useWorldStore((state) => state.resetWorld);
  const setActiveModelInfo = useWorldStore((state) => state.setActiveModelInfo);
  const setActivePanel = useUIStore((state) => state.setActivePanel);

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'analyzed'>('idle');
  const [progress, setProgress] = useState(0);
  const [pipelineStep, setPipelineStep] = useState('');
  
  // Custom GLB uploads require domain mapping
  const [uploadDomain, setUploadDomain] = useState<'architecture' | 'anatomy' | 'mechanical'>('architecture');
  const [detectionResult, setDetectionResult] = useState<DetectedDetails | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setValidationWarning(null);
    const validation = AssetLoaderService.validateFile(file);
    
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    if (validation.error) {
      setValidationWarning(validation.error);
    }

    setSelectedFile({
      name: file.name,
      size: file.size,
      type: file.name.substring(file.name.lastIndexOf('.')).toUpperCase().substring(1)
    });

    // Generate Object URL for GLB parsing
    const url = URL.createObjectURL(file);
    setGlbBlobUrl(url);

    setStatus('idle');
    setDetectionResult(null);
  };

  const startSimulationReconstruction = () => {
    if (!selectedFile) return;

    setStatus('loading');
    setProgress(0);
    
    const isModelFile = selectedFile.type === 'GLB' || selectedFile.type === 'GLTF';
    
    const steps = isModelFile 
      ? [
          { text: 'VERIFYING FILE HEADER STRUCTURE...', progress: 20 },
          { text: 'PARSING GLTF SCENE HIERARCHY...', progress: 50 },
          { text: 'EXTRACTING GEOMETRIC COORDINATES...', progress: 80 },
          { text: 'PREPARING WORLD METADATA...', progress: 100 }
        ]
      : [
          { text: 'IDENTIFYING DOMAIN BOUNDS...', progress: 15 },
          { text: 'RUNNING AI PERCEPTION PATTERNS...', progress: 40 },
          { text: 'EXTRACTING SEMANTIC ENTITIES...', progress: 70 },
          { text: 'BUILDING WORLD STRUCTURAL GRAPH...', progress: 90 },
          { text: 'CONSTRUCTING 3D SPATIAL GEOMETRY...', progress: 100 }
        ];

    let currentStepIdx = 0;
    const interval = setInterval(() => {
      if (currentStepIdx < steps.length) {
        const step = steps[currentStepIdx];
        setPipelineStep(step.text);
        setProgress(step.progress);
        currentStepIdx++;
      } else {
        clearInterval(interval);
        finalizeReconstruction();
      }
    }, 400);
  };

  const finalizeReconstruction = () => {
    const isModelFile = selectedFile!.type === 'GLB' || selectedFile!.type === 'GLTF';
    
    if (isModelFile && glbBlobUrl) {
      // Build a minimal WorldState referencing the uploaded GLB blob URL
      const userWorldState: WorldState = {
        metadata: {
          id: 'glb_user_uploaded',
          name: selectedFile!.name,
          domain: uploadDomain,
          units: uploadDomain === 'architecture' ? 'meters' : 'millimeters',
          scale: uploadDomain === 'architecture' ? 1.0 : 0.001,
          coordinateSystem: 'y-up',
        },
        semanticClasses: DOMAIN_SCHEMAS[uploadDomain].defaultClasses.reduce((acc, curr) => {
          acc[curr.id] = curr;
          return acc;
        }, {} as Record<string, any>),
        entities: {
          asset_root: {
            id: 'asset_root',
            parentId: null,
            type: 'component',
            semanticClass: uploadDomain === 'architecture' ? 'floor' : (uploadDomain === 'anatomy' ? 'atrium' : 'casing'),
            confidence: 1.0,
            transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
            boundingBox: { min: [-1, -1, -1], max: [1, 1, 1] }, // Dynamically calculated on load
            geometry: {
              type: 'mesh',
              glbPath: glbBlobUrl
            },
            properties: {
              name: selectedFile!.name
            },
            annotations: []
          }
        },
        relationships: [],
        annotations: {}
      };

      setDetectionResult({
        domain: uploadDomain,
        typeLabel: `User Uploaded 3D Asset (${selectedFile!.type})`,
        confidence: 1.0,
        description: 'Successfully initialized generic 3D asset reference in the World Model. Full semantic segmentation pending perception analysis.',
        worldData: userWorldState,
        isGlb: true
      });
    } else {
      // png/jpg mock reconstruction logic
      const fileNameLower = selectedFile!.name.toLowerCase();
      let domain: DetectedDetails['domain'] = 'architecture';
      let typeLabel = 'Residential Floor Plan Drawing';
      let confidence = 0.964;
      let description = 'This appears to be a multi-room residential floor layout containing a central living area, kitchen, bathroom, and master bedroom, aligned in a metric grid.';
      let worldData = mockArchitectureWorld;

      if (fileNameLower.includes('heart') || fileNameLower.includes('anatomy') || fileNameLower.includes('organ')) {
        domain = 'anatomy';
        typeLabel = 'Cardiovascular Anatomical Diagram';
        confidence = 0.912;
        description = 'This represents a high-resolution anatomical structure of a human cardiac model, resolving the left/right atria, chambers, ventricles, and aortic outflow path.';
        worldData = mockAnatomyWorld;
      } else if (fileNameLower.includes('gear') || fileNameLower.includes('shaft') || fileNameLower.includes('mech')) {
        domain = 'mechanical';
        typeLabel = 'Industrial Gear Assembly CAD Blueprint';
        confidence = 0.887;
        description = 'This exhibits a mechanical rotary gear housing schematic with cogs, rotational shafts, and support bearings mapped under rotational motion properties.';
        worldData = mockMechanicalWorld;
      }

      setDetectionResult({
        domain,
        typeLabel,
        confidence,
        description,
        worldData,
        isGlb: false
      });
    }
    setStatus('analyzed');
  };

  const handleLoadWorld = () => {
    if (detectionResult) {
      setWorldSource(detectionResult.isGlb ? 'USER_GLB' : 'MOCK');
      if (detectionResult.isGlb && glbBlobUrl) {
        const initialMeta = {
          assetId: 'asset_user_uploaded',
          filename: selectedFile!.name,
          source: 'USER_GLB' as const,
          fileType: selectedFile!.name.toLowerCase().endsWith('.glb') ? 'GLB (Binary)' : 'GLTF (JSON)',
          fileSize: selectedFile!.size,
          dimensions: { width: 0, height: 0, depth: 0 },
          boundingBox: { min: [0, 0, 0] as [number, number, number], max: [0, 0, 0] as [number, number, number] },
          center: [0, 0, 0] as [number, number, number],
          nodeCount: 0,
          meshCount: 0,
          rootNodeName: 'n/a',
          units: uploadDomain === 'architecture' ? 'meters' : 'millimeters'
        };
        setActiveModelInfo(initialMeta);
      } else {
        setActiveModelInfo(null);
      }
      loadWorld(detectionResult.worldData);
      setActivePanel('tree');
    }
  };

  const loadPresetGLB = (domain: 'architecture' | 'anatomy' | 'mechanical', filename: string, path: string) => {
    resetWorld();
    
    // Construct initial meta
    const initialMeta = {
      assetId: `asset_${domain}_preset`,
      filename: filename,
      source: 'PRESET_GLB' as const,
      fileType: filename.toLowerCase().endsWith('.glb') ? 'GLB (Binary)' : 'GLTF (JSON)',
      dimensions: { width: 0, height: 0, depth: 0 },
      boundingBox: { min: [0, 0, 0] as [number, number, number], max: [0, 0, 0] as [number, number, number] },
      center: [0, 0, 0] as [number, number, number],
      nodeCount: 0,
      meshCount: 0,
      rootNodeName: 'n/a',
      units: domain === 'architecture' ? 'meters' : 'millimeters'
    };
    setActiveModelInfo(initialMeta);
    
    const presetWorldState: WorldState = {
      metadata: {
        id: `glb_preset_${domain}`,
        name: `${domain.toUpperCase()} Asset Preset`,
        domain: domain,
        units: domain === 'architecture' ? 'meters' : 'millimeters',
        scale: domain === 'architecture' ? 1.0 : 0.001,
        coordinateSystem: 'y-up',
      },
      semanticClasses: DOMAIN_SCHEMAS[domain].defaultClasses.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as Record<string, any>),
      entities: {
        asset_root: {
          id: 'asset_root',
          parentId: null,
          type: 'component',
          semanticClass: domain === 'architecture' ? 'floor' : (domain === 'anatomy' ? 'atrium' : 'casing'),
          confidence: 1.0,
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          boundingBox: { min: [-1, -1, -1], max: [1, 1, 1] },
          geometry: {
            type: 'mesh',
            glbPath: path
          },
          properties: {
            name: filename
          },
          annotations: []
        }
      },
      relationships: [],
      annotations: {}
    };

    setWorldSource('PRESET_GLB');
    loadWorld(presetWorldState);
    setActivePanel('tree');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus('idle');
    setDetectionResult(null);
    setProgress(0);
    setValidationWarning(null);
    setGlbBlobUrl(null); // Triggers object URL revocation in Zustand
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Upload Zone */}
      {!selectedFile && (
        <div
          className={`upload-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".png,.jpg,.jpeg,.pdf,.glb,.gltf"
          />
          <UploadCloud className="upload-zone-icon" />
          <div>
            <p style={{ fontWeight: 'bold' }}>DRAG & DROP VISUAL / 3D INPUT</p>
            <p className="text-muted" style={{ fontSize: '11px', marginTop: '4px' }}>
              Accepts PNG, JPG blueprint maps or standard GLB models
            </p>
          </div>
        </div>
      )}

      {/* Selected File Details & Custom GLB Domain selector */}
      {selectedFile && status === 'idle' && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '12px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>INPUT LOADED:</span>
            <span style={{ fontWeight: 'bold', wordBreak: 'break-all' }}>{selectedFile.name}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Size: {(selectedFile.size / 1024).toFixed(1)} KB | Format: {selectedFile.type}
            </span>
          </div>

          {validationWarning && (
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid var(--accent-orange)', padding: '6px', borderRadius: '4px', fontSize: '10px', color: 'var(--accent-orange)' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* If uploading a raw 3D file, prompt domain identifier */}
          {(selectedFile.type === 'GLB' || selectedFile.type === 'GLTF') && (
            <div className="flex-col" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                TARGET DOMAIN:
              </label>
              <select
                value={uploadDomain}
                onChange={(e) => setUploadDomain(e.target.value as any)}
                style={{
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  outline: 'none'
                }}
              >
                <option value="architecture">Architecture</option>
                <option value="anatomy">Anatomy</option>
                <option value="mechanical">Mechanical</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn primary btn-small" onClick={startSimulationReconstruction} style={{ flex: 1 }}>
              <Cpu size={12} />
              <span>Process & Import</span>
            </button>
            <button className="btn btn-small" onClick={handleReset}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Processing Loader */}
      {status === 'loading' && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-cyan)' }}>
            <span>PROCESSING INPUT ASSET...</span>
            <span>{progress}%</span>
          </div>
          
          <div style={{ width: '100%', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--accent-cyan)',
                boxShadow: '0 0 8px var(--accent-cyan)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {pipelineStep}
          </span>
        </div>
      )}

      {/* Reconstruction Complete Result */}
      {status === 'analyzed' && detectionResult && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '16px',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <CheckCircle2 size={16} style={{ color: 'var(--accent-green)' }} />
            <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>METADATA LOADED</span>
          </div>

          <table className="property-table" style={{ marginTop: '0' }}>
            <tbody>
              <tr>
                <th>Domain</th>
                <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{detectionResult.domain.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Format Type</th>
                <td>{detectionResult.typeLabel}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td>
                  <span className="confidence-badge confidence-high">
                    READY TO RENDER
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}
          >
            {detectionResult.description}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn primary btn-small" onClick={handleLoadWorld} style={{ flex: 1 }}>
              <Eye size={12} />
              <span>Load 3D Viewport</span>
            </button>
            <button className="btn btn-small" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Preset Pre-loaders */}
      {status === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Architecture presets */}
          <div>
            <div className="section-title">Architecture Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockArchitectureWorld);
                  setActivePanel('tree');
                }}
              >
                🏠 Load Mock Floorplan (Procedural)
              </button>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                onClick={() => loadPresetGLB('architecture', 'house.glb', '/models/architecture/house.glb')}
              >
                📁 Load Building Asset (Real GLB)
              </button>
            </div>
          </div>

          {/* Anatomy presets */}
          <div>
            <div className="section-title">Anatomy Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockAnatomyWorld);
                  setActivePanel('tree');
                }}
              >
                ❤️ Load Mock Heart (Procedural)
              </button>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                onClick={() => loadPresetGLB('anatomy', 'heart.glb', '/models/anatomy/heart.glb')}
              >
                📁 Load Heart Asset (Real GLB)
              </button>
            </div>
          </div>

          {/* Mechanical presets */}
          <div>
            <div className="section-title">Mechanical Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)' }}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockMechanicalWorld);
                  setActivePanel('tree');
                }}
              >
                ⚙️ Load Mock Gearbox (Procedural)
              </button>
              <button
                className="btn btn-small"
                style={{ justifyContent: 'flex-start', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                onClick={() => loadPresetGLB('mechanical', 'gearbox.glb', '/models/mechanical/gearbox.glb')}
              >
                📁 Load Gear Assembly (Real GLB)
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default UploadPanel;
```