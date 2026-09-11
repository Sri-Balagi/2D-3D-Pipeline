import React, { useState, useRef } from 'react';
import { useWorldStore } from '../../state/useWorldStore';
import { useUIStore } from '../../state/useUIStore';
import { AssetLoaderService } from '../../services/modelLoader';
import { DOMAIN_SCHEMAS } from '../../types/semantic';
import type { WorldState } from '../../types/world';
import { CheckCircle2, Cpu, Eye, AlertTriangle } from 'lucide-react';
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
  const pipelineStatus = useWorldStore((state) => state.pipelineStatus);
  const setPipelineStatus = useWorldStore((state) => state.setPipelineStatus);
  const setAnimatedMeshes = useWorldStore((state) => state.setAnimatedMeshes);

  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [actualFile, setActualFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'analyzed'>('idle');
  const [isUploadingToAI, setIsUploadingToAI] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pipelineStep, setPipelineStep] = useState('');
  const [isImageProcessed, setIsImageProcessed] = useState(false);
  
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
    setActualFile(file);

    // Generate Object URL for GLB parsing
    const url = URL.createObjectURL(file);
    setGlbBlobUrl(url);

    setStatus('idle');
    setDetectionResult(null);
  };

  const startSimulationReconstruction = async () => {
    if (!selectedFile || !actualFile) return;

    if (selectedFile.type === 'PNG' || selectedFile.type === 'JPG' || selectedFile.type === 'JPEG') {
      setIsUploadingToAI(true);
      
      try {
        const formData = new FormData();
        formData.append('file', actualFile);
        
        const response = await fetch('http://localhost:8000/process', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to process image');
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setAnimatedMeshes(data.meshes, data.organ);
        setIsImageProcessed(true);
      } catch (err: any) {
        console.error(err);
        alert(`Failed to process image: ${err.message || 'Make sure the backend is running.'}`);
      } finally {
        setIsUploadingToAI(false);
      }
      return;
    }

    setStatus('loading');
    setProgress(0);
    
    // Explicit Phase 2 pipeline status mock steps (source === 'MOCK' allows progress percentage)
    const pipelineStates: { state: any; message: string; stepDetails: string; progress: number }[] = [
      { state: 'UPLOADING', message: 'UPLOADING INPUT BUFFER', stepDetails: 'Caching local file stream...', progress: 15 },
      { state: 'ANALYZING', message: 'ANALYZING GEOMETRIC ENVELOPE', stepDetails: 'Determining projection bounds...', progress: 35 },
      { state: 'DETECTING', message: 'DETECTING SEMANTIC COMPONENTS', stepDetails: 'Running contour classifiers...', progress: 55 },
      { state: 'UNDERSTANDING', message: 'UNDERSTANDING EDGE STRUCTURES', stepDetails: 'Mapping entity relationship nodes...', progress: 75 },
      { state: 'RECONSTRUCTING', message: 'RECONSTRUCTING 3D MESH', stepDetails: 'Meshing semantic coordinates...', progress: 90 },
      { state: 'VALIDATING', message: 'VALIDATING VOLUME BOUNDARIES', stepDetails: 'Running safety validation overlays...', progress: 98 },
    ];

    let currentStepIdx = 0;
    
    // Set initial uploading state
    setPipelineStatus({
      state: 'UPLOADING',
      progress: 0,
      message: 'UPLOADING SOURCE',
      stepDetails: 'Establishing stream buffer...',
      source: 'MOCK',
      timestamp: Date.now()
    });

    const interval = setInterval(() => {
      if (currentStepIdx < pipelineStates.length) {
        const step = pipelineStates[currentStepIdx];
        setPipelineStep(step.stepDetails);
        setProgress(step.progress);
        setPipelineStatus({
          state: step.state,
          progress: step.progress,
          message: step.message,
          stepDetails: step.stepDetails,
          source: 'MOCK',
          timestamp: Date.now()
        });
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setPipelineStatus({
          state: 'COMPLETE',
          progress: 100,
          message: 'PIPELINE COMPLETE',
          stepDetails: 'Reconstructed world metadata is ready.',
          source: 'MOCK',
          timestamp: Date.now()
        });
        finalizeReconstruction();
      }
    }, 500);
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
        worldData = { ...mockAnatomyWorld, entities: {}, relationships: [], annotations: {} };
      } else if (fileNameLower.includes('gear') || fileNameLower.includes('shaft') || fileNameLower.includes('mech')) {
        domain = 'mechanical';
        typeLabel = 'Industrial Gear Assembly CAD Blueprint';
        confidence = 0.887;
        description = 'This exhibits a mechanical rotary gear housing schematic with cogs, rotational shafts, and support bearings mapped under rotational motion properties.';
        worldData = { ...mockMechanicalWorld, entities: {}, relationships: [], annotations: {} };
      } else {
        worldData = { ...mockArchitectureWorld, entities: {}, relationships: [], annotations: {} };
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
            accept=".png,.jpg,.jpeg"
          />
          {/* Custom SVG Isometric Wireframe Node Structure */}
          <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '4px' }}>
            <path d="M32 6L58 18L32 30L6 18L32 6Z" stroke="var(--vf-violet)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M6 18V46L32 58V30L6 18Z" stroke="var(--vf-lavender)" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(196, 181, 253, 0.05)" />
            <path d="M58 18V46L32 58V30L58 18Z" stroke="var(--vf-lavender)" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(124, 58, 237, 0.05)" />
            <circle cx="32" cy="30" r="2" fill="var(--vf-gold)" />
            <path d="M12 24L32 34L52 24" stroke="var(--vf-gold-soft)" strokeWidth="1.0" strokeDasharray="3,3" opacity="0.7" />
          </svg>
          <div>
            <p style={{ fontWeight: '600', fontSize: '11px', color: 'var(--vf-text-primary)', letterSpacing: '0.5px' }}>SPATIAL INPUT</p>
            <p style={{ fontSize: '10px', color: 'var(--vf-text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
              Provide visual or spatial evidence.<br />
              Accepts PNG, JPG assets.
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
            <span style={{ fontSize: '9px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)' }}>INTAKE BUFFER:</span>
            <span style={{ fontWeight: 'bold', fontSize: '12px', wordBreak: 'break-all' }}>{selectedFile.name}</span>
            <span style={{ fontSize: '10px', color: 'var(--vf-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              Size: {(selectedFile.size / 1024).toFixed(1)} KB | Type: {selectedFile.type}
            </span>
          </div>

          {/* If uploading a 2D image, display it */}
          {(selectedFile.type === 'PNG' || selectedFile.type === 'JPG' || selectedFile.type === 'JPEG') && glbBlobUrl && (
            <div style={{ marginTop: '8px', border: '1px solid var(--vf-border)', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
              <img 
                src={glbBlobUrl} 
                alt="Uploaded input" 
                style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }} 
              />
            </div>
          )}

          {validationWarning && (
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(212, 175, 106, 0.05)', border: '1px solid var(--vf-gold)', padding: '6px', borderRadius: '4px', fontSize: '10px', color: 'var(--vf-gold-soft)' }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }} />
              <span>{validationWarning}</span>
            </div>
          )}

          {/* If uploading a raw 3D file, prompt domain identifier */}
          {(selectedFile.type === 'GLB' || selectedFile.type === 'GLTF') && (
            <div className="flex-col" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <label style={{ fontSize: '9px', color: 'var(--vf-text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
                TARGET DOMAIN SCHEMA:
              </label>
              <select
                value={uploadDomain}
                onChange={(e) => setUploadDomain(e.target.value as any)}
                style={{
                  background: 'var(--vf-bg)',
                  color: 'var(--vf-text-primary)',
                  border: '1px solid var(--vf-border)',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="architecture">Architecture</option>
                <option value="anatomy">Anatomy</option>
                <option value="mechanical">Mechanical</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn btn-small" onClick={startSimulationReconstruction} style={{ flex: 1, backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: 'var(--vf-violet)', color: 'var(--vf-lavender)' }}>
              <Cpu size={11} />
              <span>PROCESS INPUT</span>
            </button>
            <button className="btn btn-small" onClick={handleReset}>
              CLEAR
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
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--vf-lavender)' }}>
            <span style={{ color: 'var(--vf-gold-soft)', fontWeight: 'bold' }}>MOCK PIPELINE (DEMO MODE)</span>
            <span>{progress}%</span>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--vf-text-primary)', fontWeight: '600' }}>
            STEP: {pipelineStatus?.message ?? 'INTAKING...'}
          </div>
          
          <div style={{ width: '100%', height: '4px', background: 'var(--vf-deep-violet)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--vf-violet)',
                boxShadow: '0 0 8px var(--vf-violet)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <span style={{ fontSize: '9px', color: 'var(--vf-text-muted)' }}>
            {pipelineStatus?.stepDetails ?? pipelineStep}
          </span>
          <span style={{ fontSize: '8px', color: 'var(--vf-text-muted)', borderTop: '1px solid var(--vf-border)', paddingTop: '4px', marginTop: '2px' }}>
            * This UI simulates reconstruction pipeline states
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--vf-border)', paddingBottom: '8px' }}>
            <CheckCircle2 size={14} style={{ color: 'var(--vf-lavender)' }} />
            <span style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--vf-text-primary)' }}>RECONSTRUCTION COMPLETE</span>
          </div>

          <table className="property-table" style={{ marginTop: '0' }}>
            <tbody>
              <tr>
                <th>Domain</th>
                <td style={{ color: 'var(--vf-lavender)', fontWeight: 'bold' }}>{detectionResult.domain.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Format Type</th>
                <td>{detectionResult.typeLabel}</td>
              </tr>
              <tr>
                <th>Perception</th>
                <td>
                  <span style={{ color: 'var(--vf-gold-soft)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    {Math.round(detectionResult.confidence * 100)}% CONFIDENCE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid var(--vf-border)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--vf-text-secondary)',
              lineHeight: '1.4'
            }}
          >
            {detectionResult.description}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button className="btn btn-small" onClick={handleLoadWorld} style={{ flex: 1, backgroundColor: 'rgba(124, 58, 237, 0.15)', borderColor: 'var(--vf-violet)', color: 'var(--vf-lavender)' }}>
              <Eye size={11} />
              <span>LOAD VIEWPORT</span>
            </button>
            <button className="btn btn-small" onClick={handleReset}>
              RESET
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
              <button
                className="btn btn-small btn-preset"
                style={{ justifyContent: 'flex-start', opacity: 0.4, cursor: 'not-allowed' }}
                disabled={true}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockArchitectureWorld);
                  setActivePanel('tree');
                }}
              >
                <span className="preset-indicator">•</span>
                <span>PROCEDURAL MOCK FLOORPLAN</span>
              </button>
              <button
                className="btn btn-small btn-preset-real"
                style={{ justifyContent: 'flex-start', opacity: 0.4, cursor: 'not-allowed' }}
                disabled={true}
                onClick={() => loadPresetGLB('architecture', 'house.glb', '/models/architecture/house.glb')}
              >
                <span className="preset-indicator-real">◇</span>
                <span>REAL BUILDING GEOMETRY (GLB)</span>
              </button>
            </div>
          </div>

          {/* Anatomy presets */}
          <div>
            <div className="section-title">Anatomy Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
              <button
                className="btn btn-small btn-preset"
                style={{ justifyContent: 'flex-start', opacity: isImageProcessed ? 1 : 0.4, cursor: isImageProcessed ? 'pointer' : 'not-allowed' }}
                disabled={!isImageProcessed}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockAnatomyWorld);
                  setActivePanel('tree');
                }}
              >
                <span className="preset-indicator">•</span>
                <span>PROCEDURAL MOCK ORGAN</span>
              </button>
              <button
                className="btn btn-small btn-preset-real"
                style={{ justifyContent: 'flex-start', opacity: isImageProcessed ? 1 : 0.4, cursor: isImageProcessed ? 'pointer' : 'not-allowed' }}
                disabled={!isImageProcessed}
                onClick={() => loadPresetGLB('anatomy', 'heart.glb', '/models/anatomy/heart.glb')}
              >
                <span className="preset-indicator-real">◇</span>
                <span>REAL ANATOMY STRUCTURE (GLB)</span>
              </button>
            </div>
          </div>

          {/* Mechanical presets */}
          <div>
            <div className="section-title">Mechanical Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '4px' }}>
              <button
                className="btn btn-small btn-preset"
                style={{ justifyContent: 'flex-start', opacity: 0.4, cursor: 'not-allowed' }}
                disabled={true}
                onClick={() => {
                  setWorldSource('MOCK');
                  loadWorld(mockMechanicalWorld);
                  setActivePanel('tree');
                }}
              >
                <span className="preset-indicator">•</span>
                <span>PROCEDURAL MOCK GEARBOX</span>
              </button>
              <button
                className="btn btn-small btn-preset-real"
                style={{ justifyContent: 'flex-start', opacity: 0.4, cursor: 'not-allowed' }}
                disabled={true}
                onClick={() => loadPresetGLB('mechanical', 'gearbox.glb', '/models/mechanical/gearbox.glb')}
              >
                <span className="preset-indicator-real">◇</span>
                <span>REAL GEARBOX ASSEMBLY (GLB)</span>
              </button>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default UploadPanel;
