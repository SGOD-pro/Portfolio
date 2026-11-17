"use client";

import React, { useMemo, useRef, useState, useEffect, useId, useSyncExternalStore } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import * as THREE from "three";
import { StaticCodeFallback } from "./StaticCodeFallback";

export { StaticCodeFallback };

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
  resetOnRelease?: boolean;
  resetRotationTrigger?: number;
  materialType?: "clay" | "metallic" | "plastic" | "glossy" | "glass";
};

const buildMaterial = (
  materialType: NonNullable<CodeIcon3DProps["materialType"]>,
  color: string,
  emissiveColor: string,
  metalness: number,
  roughness: number
) => {
  switch (materialType) {
    case "glass":
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.08,
        metalness: Math.min(metalness * 0.1, 0.1),
        roughness: Math.min(roughness * 0.1, 0.1),
        transmission: 0.9,
        transparent: true,
        opacity: 0.7,
        ior: 1.5,
        thickness: 0.6,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
      });
    case "glossy":
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.16,
        metalness: metalness ?? 0.6,
        roughness: roughness ?? 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        side: THREE.DoubleSide,
      });
    case "metallic":
      return new THREE.MeshPhysicalMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.18,
        metalness: metalness ?? 1,
        roughness: roughness ?? 0.15,
        clearcoat: 0.6,
        clearcoatRoughness: 0.08,
        side: THREE.DoubleSide,
      });
    case "plastic":
      return new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.1,
        metalness: metalness !== undefined ? metalness * 0.4 : 0.2,
        roughness: roughness ?? 0.45,
        side: THREE.DoubleSide,
      });
    case "clay":
    default:
      return new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveColor,
        emissiveIntensity: 0.08,
        metalness: metalness !== undefined ? metalness * 0.2 : 0.1,
        roughness: roughness ?? 0.85,
        side: THREE.DoubleSide,
      });
  }
};

function CodeIcon3D({
  extrudeDepth = 0.6,
  color = "#b46004",
  emissiveColor = "#b46004",
  size = 3,
  rotationSpeed = 0.3,
  metalness = 0.5,
  roughness = 0.8,
  bevelEnabled = true,
  bevelThickness = 0.1,
  bevelSize = 0.05,
  onHover,
  autoRotate = true,
  pauseOnHover = true,
  isInteracting = false,
  resetOnRelease = true,
  resetRotationTrigger,
  materialType = "glossy",
}: CodeIcon3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const resetToOrigin = useRef(false);
  const lastResetTrigger = useRef<number | undefined>(undefined);

  const iconGroup = useMemo(() => {
    const loader = new SVGLoader();
    const svgData = loader.parse(SVG_STRING.replace(/currentColor/g, color));
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: extrudeDepth,
      bevelEnabled,
      bevelThickness,
      bevelSize,
      bevelSegments: 4,
      curveSegments: 12,
    };
    const meshes: THREE.Mesh[] = [];
    svgData.paths.forEach((path) => {
      SVGLoader.createShapes(path).forEach((shape: THREE.Shape) => {
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(
          geometry,
          buildMaterial(materialType, color, emissiveColor, metalness, roughness)
        );
        meshes.push(mesh);
      });
    });
    const group = new THREE.Group();
    meshes.forEach((m) => group.add(m));
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
    const targetScale = size / (maxDim || 1);
    group.scale.setScalar(targetScale);
    group.position.copy(center.clone().negate().multiplyScalar(targetScale));
    return group;
  }, [
    extrudeDepth,
    color,
    emissiveColor,
    size,
    metalness,
    roughness,
    bevelEnabled,
    bevelThickness,
    bevelSize,
    materialType,
  ]);

  useEffect(() => {
    return () => {
      iconGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose?.());
          else child.material?.dispose?.();
        }
      });
    };
  }, [iconGroup]);

  const { invalidate } = useThree();

  useEffect(() => {
    if (!resetOnRelease || resetRotationTrigger === undefined) return;
    if (resetRotationTrigger === lastResetTrigger.current) return;
    lastResetTrigger.current = resetRotationTrigger;
    resetToOrigin.current = true;
    invalidate();
  }, [resetOnRelease, resetRotationTrigger, invalidate]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (resetToOrigin.current && !isInteracting) {
      groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, 0, 3.5, delta);
      groupRef.current.rotation.z = THREE.MathUtils.damp(groupRef.current.rotation.z, 0, 3.5, delta);
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, 0, 3.5, delta);
      invalidate();
      if (
        Math.abs(groupRef.current.rotation.x) < 0.001 &&
        Math.abs(groupRef.current.rotation.z) < 0.001 &&
        Math.abs(groupRef.current.rotation.y) < 0.001
      ) {
        groupRef.current.rotation.x = 0;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = 0;
        resetToOrigin.current = false;
      }
      return;
    }
    if (autoRotate && !isInteracting && !(pauseOnHover && isHovered)) {
      groupRef.current.rotation.y += delta * rotationSpeed;
      invalidate();
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => {
        setIsHovered(true);
        if (onHover) onHover(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        if (onHover) onHover(false);
      }}
    >
      <primitive object={iconGroup} />
    </group>
  );
}

type OrbitControlsLike = {
  getPolarAngle: () => number;
  setPolarAngle: (a: number) => void;
  setAzimuthalAngle: (a: number) => void;
  update: () => void;
};

type ControlsResetState = { active: boolean; targetPolar: number; targetAzimuth: number };

function ControlsResetter({
  controlsRef,
  resetStateRef,
}: {
  controlsRef: React.MutableRefObject<OrbitControlsLike | null>;
  resetStateRef: React.MutableRefObject<ControlsResetState>;
}) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || !resetStateRef.current.active) return;
    const currentPolar = controls.getPolarAngle();
    const nextPolar = THREE.MathUtils.damp(currentPolar, resetStateRef.current.targetPolar, 2.2, delta);
    controls.setPolarAngle(nextPolar);
    controls.setAzimuthalAngle(resetStateRef.current.targetAzimuth);
    controls.update();
    if (Math.abs(nextPolar - resetStateRef.current.targetPolar) < 0.001) {
      resetStateRef.current.active = false;
    }
  });
  return null;
}

let cachedWebGL2Support: boolean | null = null;

function checkWebGL2Support(): boolean {
  if (typeof window === "undefined") return false;
  if (cachedWebGL2Support !== null) return cachedWebGL2Support;
  try {
    const canvas = document.createElement("canvas");
    const gl = !!(window.WebGL2RenderingContext && canvas.getContext("webgl2"));
    if (gl) {
      const ctx = canvas.getContext("webgl2");
      ctx?.getExtension("WEBGL_lose_context")?.loseContext();
    }
    cachedWebGL2Support = gl;
    return gl;
  } catch {
    cachedWebGL2Support = false;
    return false;
  }
}

const emptySubscribe = () => () => {};
const getSnapshotTrue = () => true;
const getSnapshotFalse = () => false;

function useIsClient() {
  return useSyncExternalStore(emptySubscribe, getSnapshotTrue, getSnapshotFalse);
}

function useCanRender3D() {
  const isClient = useIsClient();
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => {
      if (!isClient) return false;
      const hasWebGL2 = checkWebGL2Support();
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      return hasWebGL2 && !prefersReducedMotion;
    },
    () => false
  );
}

type InteractiveCodeIconProps = Omit<CodeIcon3DProps, "onHover"> & {
  width?: string | number;
  height?: string | number;
  background?: string;
  enableZoom?: boolean;
  enableEnvironment?: boolean;
  resetOnRelease?: boolean;
};

class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("3D WebGL render fallback triggered:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function InteractiveCodeIcon({
  width = "100%",
  height = "100%",
  background = "transparent",
  enableZoom = false,
  resetOnRelease = true,
  color = "#b46004",
  autoRotate = false,
  ...props
}: InteractiveCodeIconProps) {
  const [isInteracting, setIsInteracting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [resetCounter, setResetCounter] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const canRender3D = useCanRender3D();
  const controlsRef = useRef<OrbitControlsLike | null>(null);
  const initialPolarRef = useRef<number | null>(null);
  const resetStateRef = useRef<ControlsResetState>({ active: false, targetPolar: 0, targetAzimuth: 0 });

  const stableId = useId();

  if (!canRender3D || contextLost) {
    return <StaticCodeFallback color={color} height={height} />;
  }

  const handleReset = () => {
    setResetCounter((prev) => prev + 1);
    if (controlsRef.current) {
      resetStateRef.current = {
        active: true,
        targetPolar: initialPolarRef.current ?? Math.PI / 2,
        targetAzimuth: 0,
      };
    }
  };

  return (
    <div style={{ width, height, background, position: "relative" }}>
      <WebGLErrorBoundary fallback={<StaticCodeFallback color={color} height={height} />}>
        <Canvas
          key={stableId}
          camera={{ position: [0, 0, 4.5], fov: 45 }}
          frameloop={autoRotate ? "always" : "demand"}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "default",
            preserveDrawingBuffer: false,
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              event.preventDefault();
              console.warn("WebGL context lost on 3D canvas; rendering static fallback");
              setContextLost(true);
            });
            gl.setPixelRatio(Math.min(typeof window !== "undefined" ? window.devicePixelRatio ?? 1 : 1, 2));
            gl.shadowMap.enabled = false;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 6, 6]} intensity={1.8} />
          <directionalLight position={[-6, -3, 4]} intensity={0.8} color="#7c3aed" />
          <pointLight position={[-4, -3, 4]} intensity={0.8} color="#06b6d4" />
          <pointLight position={[4, 3, -4]} intensity={0.8} color="#f59e0b" />

          <React.Suspense fallback={null}>
            <CodeIcon3D
              {...props}
              autoRotate={autoRotate}
              color={color}
              isInteracting={isInteracting}
              resetOnRelease={resetOnRelease}
              resetRotationTrigger={resetCounter}
              onHover={setIsHovered}
            />

            <OrbitControls
              makeDefault
              ref={(ref) => {
                controlsRef.current = ref as unknown as OrbitControlsLike;
                if (ref && initialPolarRef.current === null) {
                  initialPolarRef.current = (ref as unknown as OrbitControlsLike).getPolarAngle();
                }
              }}
              enableZoom={enableZoom}
              enablePan={false}
              dampingFactor={0.05}
              enableDamping={true}
              autoRotate={false}
              onStart={() => setIsInteracting(true)}
              onEnd={() => {
                setIsInteracting(false);
                if (resetOnRelease) {
                  handleReset();
                }
              }}
            />

            <ControlsResetter controlsRef={controlsRef} resetStateRef={resetStateRef} />
          </React.Suspense>
        </Canvas>
      </WebGLErrorBoundary>

      <button
        type="button"
        onClick={handleReset}
        className="absolute top-2 right-2 px-2 py-0.5 text-[10px] uppercase font-mono rounded border border-segment/60 bg-surface/80 text-muted hover:text-foreground hover:border-accent transition-colors z-20 focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label="Reset 3D view orientation"
        title="Reset 3D view"
      >
        Reset
      </button>

      {isHovered && !isInteracting && (
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            color: "#94a3b8",
            pointerEvents: "none",
            opacity: 0.8,
          }}
          className="w-full text-xs text-center font-mono"
        >
          Interactive <span className="text-accent">&lt;/&gt;</span>
        </div>
      )}
    </div>
  );
}
