"use client";

import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Quaternion, Euler } from "three";
import { PointerLockControls } from "@react-three/drei";
import React from "react";

const MOVE_SPEED = 0.5;
const BOOST_MULTIPLIER = 2.5;
const ROTATION_SPEED = 0.003;
const MAX_PITCH = Math.PI / 2 - 0.1; // Prevent complete flipping

interface FirstPersonControllerProps {
  onMovementChange?: (moving: boolean, boosting: boolean) => void;
}

export const FirstPersonController = React.forwardRef<
  any,
  FirstPersonControllerProps
>(function FirstPersonController({ onMovementChange }, ref) {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();

  // Movement state
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const moveUp = useRef(false);
  const moveDown = useRef(false);
  const boost = useRef(false);
  const isMoving = useRef(false);

  // Velocity vectors
  const velocity = useRef(new Vector3());
  const rotationVelocity = useRef(new Vector3());

  // Auto-lock pointer when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (controlsRef.current && !controlsRef.current.isLocked) {
        controlsRef.current.lock();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Forward ref ke parent
  useEffect(() => {
    if (typeof ref === "function") {
      ref(controlsRef.current);
    } else if (ref) {
      (ref as React.MutableRefObject<any>).current = controlsRef.current;
    }
  }, [ref]);

  // Handle keyboard events for movement
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveForward.current = true;
          break;
        case "KeyS":
          moveBackward.current = true;
          break;
        case "KeyA":
          moveLeft.current = true;
          break;
        case "KeyD":
          moveRight.current = true;
          break;
        case "KeyQ":
          moveUp.current = true;
          break;
        case "KeyE":
          moveDown.current = true;
          break;
        case "ShiftLeft":
          boost.current = true;
          break;
      }
      updateMovementState();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyW":
          moveForward.current = false;
          break;
        case "KeyS":
          moveBackward.current = false;
          break;
        case "KeyA":
          moveLeft.current = false;
          break;
        case "KeyD":
          moveRight.current = false;
          break;
        case "KeyQ":
          moveUp.current = false;
          break;
        case "KeyE":
          moveDown.current = false;
          break;
        case "ShiftLeft":
          boost.current = false;
          break;
      }
      updateMovementState();
    };

    const updateMovementState = () => {
      const isCurrentlyMoving =
        moveForward.current ||
        moveBackward.current ||
        moveLeft.current ||
        moveRight.current ||
        moveUp.current ||
        moveDown.current;

      if (isCurrentlyMoving !== isMoving.current) {
        isMoving.current = isCurrentlyMoving;
        onMovementChange?.(isMoving.current, boost.current);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, [onMovementChange]);

  // Update spacecraft position and orientation on each frame
  useFrame((state, delta) => {
    if (!controlsRef.current || !controlsRef.current.isLocked) return;

    // Calculate speed (with boost if shift is pressed)
    const actualSpeed = boost.current
      ? MOVE_SPEED * BOOST_MULTIPLIER
      : MOVE_SPEED;

    // Get forward, right and up vectors from camera orientation
    const forward = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    const up = new Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    // Calculate movement direction based on key presses
    velocity.current.set(0, 0, 0);

    // Add each movement component based on the corresponding direction vector
    if (moveForward.current)
      velocity.current.add(forward.clone().multiplyScalar(actualSpeed));
    if (moveBackward.current)
      velocity.current.add(forward.clone().multiplyScalar(-actualSpeed));
    if (moveRight.current)
      velocity.current.add(right.clone().multiplyScalar(actualSpeed));
    if (moveLeft.current)
      velocity.current.add(right.clone().multiplyScalar(-actualSpeed));
    if (moveUp.current)
      velocity.current.add(up.clone().multiplyScalar(actualSpeed));
    if (moveDown.current)
      velocity.current.add(up.clone().multiplyScalar(-actualSpeed));

    // Apply the calculated velocity to the camera position
    camera.position.add(velocity.current.clone().multiplyScalar(delta * 50));

    // Update movement state for sound
    const isCurrentlyMoving =
      moveForward.current ||
      moveBackward.current ||
      moveLeft.current ||
      moveRight.current ||
      moveUp.current ||
      moveDown.current;

    if (isCurrentlyMoving !== isMoving.current) {
      isMoving.current = isCurrentlyMoving;
      onMovementChange?.(isMoving.current, boost.current);
    }
  });

  // Handle enabling controller lock when clicked
  const handleClick = () => {
    if (controlsRef.current && !controlsRef.current.isLocked) {
      controlsRef.current.lock();
    }
  };

  useEffect(() => {
    // Add a click listener to the whole document to lock controls when user clicks
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return <PointerLockControls ref={controlsRef} />;
});
