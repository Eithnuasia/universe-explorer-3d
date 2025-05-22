"use client";

import { Html } from "@react-three/drei";
import * as THREE from "three";

interface PlanetLabelProps {
  name: string;
  discovered: boolean;
  position: [number, number, number];
  heightOffset?: number;
}

export function PlanetLabel({
  name,
  discovered,
  position,
  heightOffset = 3,
}: PlanetLabelProps) {
  // Position above the planet with customizable height
  const labelPosition: [number, number, number] = [
    position[0],
    position[1] + heightOffset,
    position[2],
  ];

  return (
    <Html position={labelPosition} center distanceFactor={10}>
      <div
        className="select-none pointer-events-none text-center"
        style={{
          color: discovered ? "#ffffff" : "#aaaaaa",
          fontSize: "200px",
          fontWeight: "bold",
          textShadow: "0 3px 5px rgba(0,0,0,1)",
        }}
      >
        {discovered ? name : "?"}
      </div>
    </Html>
  );
}
