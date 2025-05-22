"use client";

import { Planet } from "./planet";
import { Sun } from "./sun";
import { OrbitLine } from "./orbit-line";
import { planets } from "@/lib/constants/planets";
import { usePlanetInteraction } from "@/lib/hooks/use-planet-interaction";
import { ErrorBoundary } from "./error-boundary";
import { Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

// Fallback planet component jika terjadi error
const FallbackPlanet = ({
  planet,
  onClick,
  isDiscovered,
}: {
  planet: any;
  onClick: (name: string) => void;
  isDiscovered: boolean;
}) => (
  <group>
    <Sphere args={[planet.radius, 32, 32]} onClick={() => onClick(planet.name)}>
      <meshStandardMaterial
        color={planet.color}
        metalness={0.3}
        roughness={0.4}
        emissive={planet.color}
        emissiveIntensity={0.2}
      />
    </Sphere>
  </group>
);

// Custom Moon orbit line with higher opacity
function MoonOrbitLine({ radius }: { radius: number }) {
  return (
    <>
      <OrbitLine radius={radius} />
      {/* Additional visible orbit line for moon */}
      <Line
        points={Array.from({ length: 48 }, (_, i) => {
          const theta = (i / 47) * Math.PI * 2;
          return new THREE.Vector3(
            radius * Math.cos(theta),
            0,
            radius * Math.sin(theta)
          );
        })}
        color="#ffffff"
        opacity={0.9}
        transparent
        lineWidth={2}
      />
    </>
  );
}

export function SolarSystem({
  onObjectClick,
  discoveredPlanets,
}: {
  onObjectClick: (name: string, description: string) => void;
  discoveredPlanets: string[];
}) {
  const { discoveredPlanets: existingDiscoveredPlanets, handlePlanetClick } =
    usePlanetInteraction();

  // Filter out regular planets (excluding moons)
  const regularPlanets = planets.filter((planet) => !planet.parentPlanet);

  return (
    <>
      {/* Sun */}
      <Sun
        isDiscovered={discoveredPlanets.includes("Sun")}
        onClick={() => {
          const sunDescription =
            "Matahari adalah bintang di pusat tata surya kita. Matahari sangat besar dan sangat panas, memancarkan cahaya dan panas yang membuat kehidupan di Bumi mungkin. Matahari terdiri dari gas hidrogen dan helium, dan memiliki diameter sekitar 1,4 juta kilometer.";
          onObjectClick("Sun", sunDescription);
        }}
      />

      {/* Planets and Orbits */}
      {regularPlanets.map((planet) => (
        <group key={planet.name}>
          <OrbitLine radius={planet.orbitRadius} />
          <ErrorBoundary
            fallback={
              <FallbackPlanet
                planet={planet}
                onClick={() => onObjectClick(planet.name, planet.description)}
                isDiscovered={discoveredPlanets.includes(planet.name)}
              />
            }
          >
            <Planet
              planet={planet}
              onClick={(name) => {
                const p = planets.find((pl) => pl.name === name);
                if (p) onObjectClick(p.name, p.description);
              }}
              isDiscovered={discoveredPlanets.includes(planet.name)}
              discoveredPlanets={discoveredPlanets}
            />
          </ErrorBoundary>
        </group>
      ))}
    </>
  );
}
