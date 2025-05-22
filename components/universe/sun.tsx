"use client";

import { useRef, Suspense, Component, ReactNode, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Sphere, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { PlanetLabel } from "./planet-label";
import { usePlanetInteraction } from "@/lib/hooks/use-planet-interaction";
import { getModelPath } from "@/lib/utils";

interface SunProps {
  position?: [number, number, number];
  scale?: number;
  active?: boolean;
  onClick?: () => void;
  isDiscovered?: boolean;
}

// Error boundary for catching model loading errors
class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error loading Sun 3D model:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Sun component that uses the 3D model
function SunGLTF({ onClick }: { onClick: () => void }) {
  const sunRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF(getModelPath("/models/sun.glb"));

  // Enhance the sun's brightness
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.material) {
          // Make the sun brighter
          object.material.emissive = new THREE.Color("#FDB813");
          object.material.emissiveIntensity = 2.5;
          // Make it interactive
          object.userData.isInteractive = true;
        }
      }
    });
  }, [scene]);

  // Animate rotation
  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group scale={[2, 2, 2]} onClick={onClick}>
      <primitive ref={sunRef} object={scene} />
      {/* Add a larger glow sphere around the sun */}
      <Sphere
        args={[6, 32, 32]}
        position={[0, 0, 0]}
        onClick={onClick}
        userData={{ isInteractive: true }}
      >
        <meshBasicMaterial color="#FDB813" transparent opacity={0.15} />
      </Sphere>
    </group>
  );
}

// Fallback sphere to use if model fails to load
function SunFallback({ onClick }: { onClick: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (sunRef.current) {
      sunRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      <Sphere
        ref={sunRef}
        args={[5, 32, 32]}
        position={[0, 0, 0]}
        onClick={onClick}
        userData={{ isInteractive: true }}
      >
        <meshStandardMaterial
          color="#FDB813"
          emissive="#FDB813"
          emissiveIntensity={3}
        />
      </Sphere>
      {/* Add glow effect */}
      <Sphere
        ref={glowRef}
        args={[6, 32, 32]}
        position={[0, 0, 0]}
        onClick={onClick}
        userData={{ isInteractive: true }}
      >
        <meshBasicMaterial color="#FDB813" transparent opacity={0.2} />
      </Sphere>
    </group>
  );
}

export function Sun({
  position = [0, 0, 0],
  scale = 3,
  active = true,
  onClick,
  isDiscovered = false,
}: SunProps) {
  const { handlePlanetClick } = usePlanetInteraction();
  const sunDescription =
    "Matahari adalah bintang di pusat tata surya kita. Matahari sangat besar dan sangat panas, memancarkan cahaya dan panas yang membuat kehidupan di Bumi mungkin. Matahari terdiri dari gas hidrogen dan helium, dan memiliki diameter sekitar 1,4 juta kilometer.";

  const onObjectClick = (name: string) => {
    handlePlanetClick(name);
    if (onClick) onClick();
  };

  const fallback = <SunFallback onClick={() => onObjectClick("Sun")} />;

  return (
    <>
      <ModelErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <SunGLTF onClick={() => onObjectClick("Sun")} />
        </Suspense>
      </ModelErrorBoundary>
      <PlanetLabel
        name="Sun"
        discovered={isDiscovered}
        position={[0, 0, 0]}
        heightOffset={22} // Higher offset for the sun
      />
    </>
  );
}

// Safely preload in browser environment only
if (typeof window !== "undefined") {
  try {
    useGLTF.preload(getModelPath("/models/sun.glb"));
  } catch (error) {
    console.error("Error preloading Sun model:", error);
  }
}
