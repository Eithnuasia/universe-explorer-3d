"use client";

import { useState, useEffect } from "react";

export function SpaceshipHUD() {
  const [speed, setSpeed] = useState(0);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0, z: 0 });

  // Update HUD data
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate speed variations
      setSpeed(Math.floor(Math.random() * 200 + 800));

      // Simulate coordinate changes
      setCoordinates({
        x: Math.floor(Math.random() * 1000 - 500),
        y: Math.floor(Math.random() * 1000 - 500),
        z: Math.floor(Math.random() * 1000 - 500),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Minimalist coordinates */}
      {/* (Biarkan bagian koordinat jika memang ingin tetap ada) */}
      {/*
      <div className="absolute bottom-6 right-6 bg-black/40 rounded px-3 py-1 text-xs text-cyan-200 font-mono">
        X {coordinates.x} | Y {coordinates.y} | Z {coordinates.z}
      </div>
      */}
    </div>
  );
}
