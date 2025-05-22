"use client";

import { useRef, Suspense, Component, ReactNode, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sphere, useGLTF, Ring, Line } from "@react-three/drei";
import * as THREE from "three";
import type { Planet as PlanetType } from "@/lib/constants/planets";
import { PlanetLabel } from "./planet-label";

// Komponen untuk mendaftarkan ekstensi GLTFLoader yang diperlukan
function GLTFExtensions() {
  const { gl } = useThree();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (async () => {
        try {
          const GLTFLoaderModule = await import(
            "three/examples/jsm/loaders/GLTFLoader.js"
          );

          // Pastikan THREE.GLTFLoader tersedia dan bisa mengakses prototype-nya
          if (GLTFLoaderModule.GLTFLoader) {
            const registerExtension = (loader: any) => {
              // Implementasi manual dari KHR_materials_pbrSpecularGlossiness
              loader.register(function (parser: any) {
                // Kelas minimal untuk menangani ekstensi
                return {
                  name: "KHR_materials_pbrSpecularGlossiness",
                  getMaterialType: () => THREE.MeshStandardMaterial,
                  extendParams: (materialParams: any, materialDef: any) => {
                    // Mengonversi specular-glossiness ke metallic-roughness
                    if (
                      materialDef.extensions &&
                      materialDef.extensions.KHR_materials_pbrSpecularGlossiness
                    ) {
                      const sgDef =
                        materialDef.extensions
                          .KHR_materials_pbrSpecularGlossiness;

                      // Salin parameter dasar
                      if (sgDef.diffuseFactor) {
                        materialParams.color = new THREE.Color().fromArray(
                          sgDef.diffuseFactor
                        );
                        materialParams.opacity = sgDef.diffuseFactor[3];
                      }

                      // Setel nilai roughness dan metalness berdasarkan glossiness dan specular
                      if (sgDef.glossinessFactor !== undefined) {
                        materialParams.roughness = 1 - sgDef.glossinessFactor;
                      }

                      // Gunakan specular factor untuk mempengaruhi metalness
                      if (sgDef.specularFactor) {
                        const specular = new THREE.Color().fromArray(
                          sgDef.specularFactor
                        );
                        const maxChannel = Math.max(
                          specular.r,
                          specular.g,
                          specular.b
                        );
                        materialParams.metalness = maxChannel * 0.5;
                      }
                    }
                    return Promise.resolve();
                  },
                };
              });
            };

            // Register ekstensi ke loader instance, not to the prototype
            const loader = new GLTFLoaderModule.GLTFLoader();
            registerExtension(loader);

            // Dapatkan akses ke THREE untuk mengatur loader default
            const ThreeModule = await import("three");
            if (ThreeModule.DefaultLoadingManager) {
              ThreeModule.DefaultLoadingManager.addHandler(/\.glb$/, loader);
              ThreeModule.DefaultLoadingManager.addHandler(/\.gltf$/, loader);
            }

            // Reload model-model GLB
            try {
              useGLTF.clear("/models/jupiter.glb");
              useGLTF.clear("/models/saturn.glb");
              useGLTF.clear("/models/earth.glb");
              useGLTF.clear("/models/uranus.glb");
              useGLTF.clear("/models/neptune.glb");
              useGLTF.clear("/models/mercury.glb");
              useGLTF.clear("/models/venus.glb");
              useGLTF.clear("/models/mars.glb");
              useGLTF.clear("/models/moon.glb");

              // Preload models after clearing and registering extensions
              setTimeout(() => {
                try {
                  useGLTF.preload("/models/earth.glb");
                  useGLTF.preload("/models/saturn.glb");
                  useGLTF.preload("/models/jupiter.glb");
                  useGLTF.preload("/models/uranus.glb");
                  useGLTF.preload("/models/neptune.glb");
                  useGLTF.preload("/models/mercury.glb");
                  useGLTF.preload("/models/venus.glb");
                  useGLTF.preload("/models/mars.glb");
                  useGLTF.preload("/models/moon.glb");
                  console.log("Models preloaded after extension registration");

                  // Set flag to prevent duplicate preloading
                  if (window) {
                    (window as any).__GLTF_MODELS_PRELOADED = true;
                  }
                } catch (err) {
                  console.error("Error during model preload:", err);
                }
              }, 500);

              console.log(
                "Cleared GLB caches for reload with custom extension handler"
              );
            } catch (e) {
              console.warn("Could not clear GLB caches:", e);
            }

            console.log(
              "Successfully registered custom KHR_materials_pbrSpecularGlossiness handler"
            );
          }
        } catch (error) {
          console.error("Failed to register GLTF extensions:", error);
        }
      })();
    }
  }, [gl]);

  return null;
}

interface PlanetProps {
  planet: PlanetType;
  onClick: (name: string) => void;
  isMoon?: boolean;
  isDiscovered?: boolean;
  discoveredPlanets?: string[];
}

// Error boundary untuk menangkap error saat loading model
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
    console.error("Error loading 3D model:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Komponen Earth yang menggunakan model 3D
function EarthGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/earth.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Fallback untuk digunakan jika model gagal dimuat
function EarthFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Sphere ref={planetRef} args={[radius, 32, 32]} onClick={onClick}>
      <meshStandardMaterial
        color="#2E8BC0"
        metalness={0.3}
        roughness={0.4}
        emissive="#112244"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

// Komponen Earth dengan error handling
function EarthModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <EarthFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <EarthGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Saturn GLB component
function SaturnGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/saturn.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Saturn fallback component
function SaturnFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Mesh>(null);

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.z += delta * 0.02;
    }
  });

  return (
    <group onClick={onClick}>
      <Sphere ref={planetRef} args={[radius, 32, 32]}>
        <meshStandardMaterial
          color="#F4D03F"
          metalness={0.3}
          roughness={0.4}
          emissive="#F4D03F"
          emissiveIntensity={0.2}
        />
      </Sphere>
      <Ring
        ref={ringsRef}
        args={[radius * 1.4, radius * 2.2, 64]}
        rotation={[Math.PI / 6, 0, 0]}
      >
        <meshStandardMaterial
          color="#CDAC78"
          metalness={0.3}
          roughness={0.5}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </Ring>
    </group>
  );
}

// Saturn component with error handling
function SaturnModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <SaturnFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <SaturnGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Simple planet component
function PlanetBody({
  radius,
  color,
  onClick,
}: {
  radius: number;
  color: string;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Mesh>(null);

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <Sphere
      ref={planetRef}
      args={[radius, 24, 24]}
      onClick={onClick}
      userData={{ isInteractive: true }}
    >
      <meshStandardMaterial
        color={color}
        metalness={0.3}
        roughness={0.4}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

// Jupiter GLB component
function JupiterGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/jupiter.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Jupiter fallback component
function JupiterFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#DEB887" onClick={onClick} />;
}

// Jupiter component with error handling
function JupiterModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <JupiterFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <JupiterGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Neptune GLB component
function NeptuneGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/neptune.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Neptune fallback component
function NeptuneFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#5D8AA8" onClick={onClick} />;
}

// Neptune component with error handling
function NeptuneModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <NeptuneFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <NeptuneGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Uranus GLB component
function UranusGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/uranus.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Uranus fallback component
function UranusFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#B2FFFF" onClick={onClick} />;
}

// Uranus component with error handling
function UranusModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <UranusFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <UranusGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Mercury GLB component
function MercuryGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/mercury.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.08;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Mercury fallback component
function MercuryFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#E5E5E5" onClick={onClick} />;
}

// Mercury component with error handling
function MercuryModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <MercuryFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <MercuryGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Venus GLB component
function VenusGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/venus.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.07;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Venus fallback component
function VenusFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#DEB887" onClick={onClick} />;
}

// Venus component with error handling
function VenusModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <VenusFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <VenusGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Mars GLB component
function MarsGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const planetRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/mars.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.09;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={planetRef} object={scene} />
    </group>
  );
}

// Mars fallback component
function MarsFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return <PlanetBody radius={radius} color="#CD5C5C" onClick={onClick} />;
}

// Mars component with error handling
function MarsModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <MarsFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <MarsGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

// Moon GLB component
function MoonGLTF({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const moonRef = useRef<THREE.Object3D>(null);
  const { scene } = useGLTF("/models/moon.glb");

  // Animate rotation
  useFrame((_, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group scale={[radius, radius, radius]} onClick={onClick}>
      <primitive ref={moonRef} object={scene} />
    </group>
  );
}

// Moon fallback component
function MoonFallback({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  return (
    <Sphere args={[radius, 32, 32]} onClick={onClick}>
      <meshStandardMaterial
        color="#FFFFFF"
        metalness={0.3}
        roughness={0.4}
        emissive="#FFFFFF"
        emissiveIntensity={0.2}
      />
    </Sphere>
  );
}

// Moon component with error handling
function MoonModel({
  radius,
  onClick,
}: {
  radius: number;
  onClick: () => void;
}) {
  const fallback = <MoonFallback radius={radius} onClick={onClick} />;

  return (
    <ModelErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <MoonGLTF radius={radius} onClick={onClick} />
      </Suspense>
    </ModelErrorBoundary>
  );
}

export function Planet({
  planet,
  onClick,
  isMoon = false,
  isDiscovered = false,
  discoveredPlanets = [],
}: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const moonOrbitRef = useRef<THREE.Group>(null);
  const isEarth = planet.name === "Earth";
  const isSaturn = planet.name === "Saturn";
  const isJupiter = planet.name === "Jupiter";
  const isUranus = planet.name === "Uranus";
  const isNeptune = planet.name === "Neptune";
  const isMercury = planet.name === "Mercury";
  const isVenus = planet.name === "Venus";
  const isMars = planet.name === "Mars";

  // Add isInteractive flag to orbit group for raycaster to detect
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.userData.isInteractive = true;
    }
  }, []);

  // Handle orbit rotation
  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * planet.orbitSpeed;
    }
    // Rotate moon orbit
    if (moonOrbitRef.current) {
      moonOrbitRef.current.rotation.y += delta * 0.8; // Moon orbit speed
    }
  });

  // Render ekstensi GLTF untuk mendukung material specular-glossiness
  if (
    isSaturn ||
    isJupiter ||
    isUranus ||
    isNeptune ||
    isMercury ||
    isVenus ||
    isMars
  ) {
    return (
      <>
        <GLTFExtensions />
        {isJupiter && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <JupiterModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={17}
              />
            </group>
          </group>
        )}
        {isSaturn && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <SaturnModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0.5, 0, 0]}
                heightOffset={10}
              />
            </group>
          </group>
        )}
        {isUranus && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <UranusModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={8}
              />
            </group>
          </group>
        )}
        {isNeptune && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <NeptuneModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={8}
              />
            </group>
          </group>
        )}
        {isMercury && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <MercuryModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={4}
              />
            </group>
          </group>
        )}
        {isVenus && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <VenusModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={7}
              />
            </group>
          </group>
        )}
        {isMars && (
          <group ref={orbitRef}>
            <group position={planet.position}>
              <MarsModel
                radius={planet.radius}
                onClick={() => onClick(planet.name)}
              />
              <PlanetLabel
                name={planet.name}
                discovered={isDiscovered}
                position={[0, 0, 0]}
                heightOffset={6}
              />
            </group>
          </group>
        )}
      </>
    );
  }

  if (isEarth) {
    return (
      <group ref={orbitRef}>
        <group position={planet.position}>
          {/* Earth itself */}
          <EarthModel
            radius={planet.radius}
            onClick={() => onClick(planet.name)}
          />

          <PlanetLabel
            name={planet.name}
            discovered={isDiscovered}
            position={[0, 0, 0]}
            heightOffset={8}
          />

          {/* Moon's orbit line */}
          <Line
            points={Array.from({ length: 64 }, (_, i) => {
              const theta = (i / 63) * Math.PI * 2;
              return new THREE.Vector3(
                10 * Math.cos(theta),
                0,
                10 * Math.sin(theta)
              );
            })}
            color="#ffffff"
            opacity={0.2}
            transparent
            lineWidth={1}
          />

          {/* Moon orbiting around Earth */}
          <group ref={moonOrbitRef}>
            <group position={[10, 0, 0]}>
              <MoonModel radius={0.01} onClick={() => onClick("Moon")} />

              <PlanetLabel
                name="Moon"
                discovered={discoveredPlanets.includes("Moon")}
                position={[0, 0, 0]}
                heightOffset={3}
              />
            </group>
          </group>
        </group>
      </group>
    );
  }

  // Regular planets
  return (
    <group ref={orbitRef}>
      <group position={planet.position}>
        <PlanetBody
          radius={planet.radius}
          color={planet.color}
          onClick={() => onClick(planet.name)}
        />
        <PlanetLabel
          name={planet.name}
          discovered={isDiscovered}
          position={[0, 0, 0]}
          heightOffset={4}
        />
      </group>
    </group>
  );
}

// Safely preload in browser environment only
if (typeof window !== "undefined") {
  // Don't immediately preload - let the GLTFExtensions component handle registration first
  // Models will be preloaded after extension registration inside the component
  try {
    // We'll set up a global flag to prevent duplicate preloading
    if (!(window as any).__GLTF_MODELS_PRELOADED) {
      (window as any).__GLTF_MODELS_PRELOADED = true;

      // The GLTFExtensions component now handles clearing and preloading
      console.log(
        "GLTF preloading will be handled by the GLTFExtensions component"
      );
    }
  } catch (error) {
    console.error("Error setting up model preload configuration:", error);
  }
}
