"use client"
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import * as THREE from 'three';

const SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M10.218 3.216a.75.75 0 0 0-1.436-.431l-3 10a.75.75 0 0 0 1.436.43zM4.53 4.97a.75.75 0 0 1 0 1.06L2.56 8l1.97 1.97a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0m6.94 6.06a.75.75 0 0 1 0-1.06L13.44 8l-1.97-1.97a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0" clip-rule="evenodd"/></svg>`;

type CodeIcon3DProps = {
  extrudeDepth?: number;
  color?: string;
  emissiveColor?: string;
  size?: number;
  rotationSpeed?: number;
  metalness?: number;
  roughness?: number;
  bevelEnabled?: boolean;
  bevelThickness?: number;
  bevelSize?: number;
  onHover?: (isHovered: boolean) => void;
  autoRotate?: boolean;
  pauseOnHover?: boolean;
  isInteracting?: boolean;
  resetOnRelease?: boolean; // Reset to 0,0,0 after interaction ends
  resetRotationTrigger?: number;
  domElement?: HTMLCanvasElement | null;
  materialType?: 'clay' | 'metallic' | 'plastic' | 'glossy' | 'glass';
};

const buildMaterial = (
  materialType: NonNullable<CodeIcon3DProps['materialType']>,
  color: string,
  emissiveColor: string,
  metalness: number,
  roughness: number
) => {
  switch (materialType) {
    case 'glass':
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.08,
        metalness: 0,
        roughness: 0.08,
        transmission: 0.9,
        transparent: true,
        opacity: 0.7,
        ior: 1.5,
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide
      });
    case 'glossy':
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.16,
        metalness: 0.6,
        roughness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide
      });
    case 'metallic':
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.18,
        metalness: 1,
        roughness: 0.15,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide
      });
    case 'plastic':
      return new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.1,
        metalness: 0.2,
        roughness: 0.45,
        side: THREE.DoubleSide
      });
    case 'clay':
    default:
      return new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.08,
        metalness: 0.1,
        roughness: 0.85,
        side: THREE.DoubleSide
      });
  }
};

function CodeIcon3D({
  extrudeDepth = 0.6,
  color = '#3b82f6',
  emissiveColor = '#1d4ed8',
  size = 1.2,
  rotationSpeed = 0.6,
  metalness = 0.6,
  roughness = 0.3,
  bevelEnabled = true,
  bevelThickness = 0.06,
  bevelSize = 0.04,
  onHover,
  autoRotate = true,
  pauseOnHover = true,
  isInteracting = false,
  resetOnRelease = true,
  resetRotationTrigger,
  domElement = null,
  materialType = 'glossy',
}: CodeIcon3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const { camera } = useThree();
  const resetToOrigin = useRef(false);

  // Parse & Extrude SVG only once
  const iconGroup = useMemo(() => {
    const loader = new SVGLoader();
    const svgData = loader.parse(SVG_STRING);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: extrudeDepth,
      bevelEnabled: bevelEnabled,
      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelSegments: 4,
      curveSegments: 12
    };

    const meshes: THREE.Mesh[] = [];
    svgData.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);
      shapes.forEach((shape: THREE.Shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.computeVertexNormals();
        
        const material = buildMaterial(materialType, color, emissiveColor, metalness, roughness);
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes.push(mesh);
      });
    });

    const group = new THREE.Group();
    meshes.forEach((mesh) => group.add(mesh));

    // Center geometry and normalize scale
    const box = new THREE.Box3().setFromObject(group);
    const sizeVec = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const targetScale = size / maxDim;
    group.scale.setScalar(targetScale);
    group.position.copy(center.clone().negate().multiplyScalar(targetScale));

    return group;
  }, [extrudeDepth, color, emissiveColor, size, metalness, roughness, bevelEnabled, bevelThickness, bevelSize]);

  useEffect(() => {
    if (!resetOnRelease) {
      return;
    }
    if (resetRotationTrigger === undefined) {
      return;
    }
    resetToOrigin.current = true;
  }, [resetOnRelease, resetRotationTrigger]);

  // Auto-rotate + Reset Logic
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (resetToOrigin.current && !isInteracting) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0, 3.5, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 3.5, delta);

      const nearZero =
        Math.abs(groupRef.current.rotation.x) < 0.001 &&
        Math.abs(groupRef.current.rotation.z) < 0.001;

      if (nearZero) {
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.z = 0;
        resetToOrigin.current = false;
      }
      return;
    }

    // Auto-rotate on Y-axis only when conditions are met
    const shouldPause = pauseOnHover ? isHovered : false;
    if (autoRotate && !isInteracting && !shouldPause && !resetToOrigin.current) {
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  // Raycaster for hover detection
  useEffect(() => {
    if (!domElement) {
      return;
    }
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!groupRef.current || !domElement) {
        return;
      }

      const rect = domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      if (!inside) {
        setIsHovered((prev) => {
          if (prev && onHover) {
            onHover(false);
          }
          return false;
        });
        return;
      }

      mouse.x = (x / rect.width) * 2 - 1;
      mouse.y = -(y / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(groupRef.current.children, true);

      const isNowHovered = intersects.length > 0;
      setIsHovered((prev) => {
        if (prev !== isNowHovered && onHover) {
          onHover(isNowHovered);
        }
        return isNowHovered;
      });
    };

    domElement.addEventListener('mousemove', handleMouseMove);
    return () => domElement.removeEventListener('mousemove', handleMouseMove);
  }, [camera, domElement, onHover]);

  return (
    <group ref={groupRef}>
      <primitive object={iconGroup} />
    </group>
  );
}

type InteractiveCodeIconProps = Omit<CodeIcon3DProps, 'onHover'> & {
  width?: string | number;
  height?: string | number;
  background?: string;
  enableZoom?: boolean;
  enableEnvironment?: boolean;
  resetOnRelease?: boolean;
};

type ControlsResetState = {
  active: boolean;
  targetPolar: number;
  targetAzimuth: number;
};

function ControlsResetter({
  controlsRef,
  resetStateRef,
}: {
  controlsRef: React.MutableRefObject<any>;
  resetStateRef: React.MutableRefObject<ControlsResetState>;
}) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const resetState = resetStateRef.current;
    if (!resetState.active) return;

    const currentPolar = controls.getPolarAngle();
    const nextPolar = THREE.MathUtils.damp(currentPolar, resetState.targetPolar, 2.2, delta);

    controls.setPolarAngle(nextPolar);
    controls.setAzimuthalAngle(resetState.targetAzimuth);
    controls.update();

    if (Math.abs(nextPolar - resetState.targetPolar) < 0.001) {
      resetState.active = false;
    }
  });

  return null;
}

export default function InteractiveCodeIcon({
  width = '100%',
  height = '100vh',
  background = '#0f172a',
  enableZoom = false,
  enableEnvironment = true,
  resetOnRelease = true,
  ...props
}: InteractiveCodeIconProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [domElement, setDomElement] = useState<HTMLCanvasElement | null>(null);
  const [resetCounter, setResetCounter] = useState(0);
  const controlsRef = useRef<any>(null);
  const initialPolarRef = useRef<number | null>(null);
  const resetStateRef = useRef<ControlsResetState>({
    active: false,
    targetPolar: 0,
    targetAzimuth: 0,
  });

  useEffect(() => {
    if (!controlsRef.current || initialPolarRef.current !== null) {
      return;
    }
    initialPolarRef.current = controlsRef.current.getPolarAngle();
  }, [domElement]);

  return (
    <div style={{ width, height, background, position: 'relative' as const }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => setDomElement(gl.domElement)}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[6, 6, 6]} intensity={1.6} castShadow />
        <directionalLight position={[-6, -3, 4]} intensity={0.6} color="#7c3aed" />
        <pointLight position={[-4, -3, 4]} intensity={0.7} color="#06b6d4" />
        <pointLight position={[4, 3, -4]} intensity={0.7} color="#f59e0b" />
        {enableEnvironment && <Environment preset="city" />}

        {/* 3D Icon */}
        <CodeIcon3D
          {...props}
          isInteracting={isInteracting}
          resetOnRelease={resetOnRelease}
          resetRotationTrigger={resetCounter}
          domElement={domElement}
          onHover={setIsHovered}
        />

        {/* Interaction Controls */}
        {domElement && (
          <OrbitControls
            ref={controlsRef}
            enableZoom={enableZoom}
            enablePan={false}
            dampingFactor={0.05}
            enableDamping={true}
            autoRotate={false}
            domElement={domElement}
            onStart={() => setIsInteracting(true)}
            onEnd={() => {
              setIsInteracting(false);
              if (resetOnRelease) {
                if (controlsRef.current) {
                  resetStateRef.current.active = true;
                  resetStateRef.current.targetPolar =
                    initialPolarRef.current ?? controlsRef.current.getPolarAngle();
                  resetStateRef.current.targetAzimuth = controlsRef.current.getAzimuthalAngle();
                }
                setResetCounter((prev) => prev + 1);
              }
            }}
          />
        )}
        <ControlsResetter controlsRef={controlsRef} resetStateRef={resetStateRef} />
      </Canvas>
      
      {/* Optional: Hover indicator */}
      {isHovered && !isInteracting && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: '#94a3b8',
          pointerEvents: 'none',
          opacity: 0.8
        }} className='w-full text-xs text-center'>
          Code is caffeinated
        </div>
      )}
    </div>
  );
}