"use client";

import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

interface OrbitLineProps {
  radius: number;
}

export function OrbitLine({ radius }: OrbitLineProps) {
  // Memoize the orbit points to prevent recalculation on each render
  const points = useMemo(() => {
    // Using fewer points for improved performance (48 instead of 65)
    return Array.from({ length: 48 }, (_, i) => {
      const theta = (i / 47) * Math.PI * 2;
      return new THREE.Vector3(
        radius * Math.cos(theta),
        0,
        radius * Math.sin(theta)
      );
    });
  }, [radius]);

  return (
    <Line
      points={points}
      color="#ffffff"
      opacity={0.25}
      transparent
      lineWidth={0.8}
    />
  );
}
