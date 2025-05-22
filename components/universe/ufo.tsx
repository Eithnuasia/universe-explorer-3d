"use client";

import { useRef, useState, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getModelPath } from "@/lib/utils";

interface UFOProps {
  isActive: boolean;
  onHit: () => void;
  onHealthChange: (health: number) => void;
  ufoRef?: React.RefObject<THREE.Group>;
  camera?: THREE.Camera;
  onScreenPositionChange?: (pos: { left: number; top: number }) => void;
}

export function UFO({
  isActive,
  onHit,
  onHealthChange,
  ufoRef,
  camera,
  onScreenPositionChange,
}: UFOProps) {
  const localRef = useRef<THREE.Group>(null);
  const groupRef = ufoRef || localRef;
  const [health, setHealth] = useState(600);
  const [isHit, setIsHit] = useState(false);
  const timeRef = useRef(0);
  const lastHitTimeRef = useRef(0);

  // Load UFO model
  const { scene } = useGLTF(getModelPath("/models/ufo.glb"));
  const ufoModel = scene.clone();

  // Handle health change
  useEffect(() => {
    onHealthChange(health);
  }, [health, onHealthChange]);

  // Movement system
  useFrame(() => {
    if (!groupRef.current || !isActive) return;
    // Update time
    timeRef.current += 0.022; // lebih cepat
    // 3D movement
    const t = timeRef.current;
    const maxRadius = 120; // radius maksimum, tidak melebihi Uranus
    const baseY = 18,
      ampY = 22;
    const freqX = 1.2,
      freqY = 1.1,
      freqZ = 0.9;
    let x =
      Math.cos(t * freqX + Math.sin(t * 0.3)) *
      (maxRadius * 0.9) *
      Math.sin(t * 0.2 + Math.cos(t * 0.13));
    let y = baseY + Math.sin(t * freqY + Math.cos(t * 0.5)) * ampY;
    let z =
      Math.sin(t * freqZ + Math.cos(t * 0.2)) *
      (maxRadius * 0.9) *
      Math.cos(t * 0.2 + Math.sin(t * 0.11));
    // Clamp ke dalam bola radius maxRadius
    const r = Math.sqrt(x * x + y * y + z * z);
    if (r > maxRadius) {
      const scale = maxRadius / r;
      x *= scale;
      y *= scale;
      z *= scale;
    }
    groupRef.current.position.set(x, y, z);
    groupRef.current.rotation.y = t * freqX + Math.PI;
    if (isHit && t - lastHitTimeRef.current > 0.5) {
      setIsHit(false);
    }
    if (camera && onScreenPositionChange) {
      const ufoWorldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(ufoWorldPos);
      const projected = ufoWorldPos.clone().project(camera);
      const left = ((projected.x + 1) / 2) * window.innerWidth;
      const top = ((-projected.y + 1) / 2) * window.innerHeight - 40;
      onScreenPositionChange({ left, top });
    }
  });

  const handleHit = () => {
    if (timeRef.current - lastHitTimeRef.current < 0.5) return; // Cooldown
    setHealth((prev) => {
      const newHealth = prev - 30;
      if (newHealth <= 0) {
        return 0;
      }
      return newHealth;
    });
    setIsHit(true);
    lastHitTimeRef.current = timeRef.current;
    onHit();
  };

  return (
    <group ref={groupRef} visible={isActive}>
      <primitive object={ufoModel} scale={0.09} onClick={handleHit} />
      {isHit && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3, 32, 32]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
}
