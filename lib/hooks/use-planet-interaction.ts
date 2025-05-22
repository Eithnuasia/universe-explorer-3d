"use client";

import { useState, useEffect, useCallback } from "react";
import type { Planet } from "@/lib/constants/planets";

export function usePlanetInteraction() {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [discoveredPlanets, setDiscoveredPlanets] = useState<string[]>([]);
  const [textCompleted, setTextCompleted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Handle planet click
  const handlePlanetClick = (name: string) => {
    // Add planet to discovered list if not already there
    if (!discoveredPlanets.includes(name)) {
      setDiscoveredPlanets((prev) => [...prev, name]);
    }

    setSelectedPlanet(name);
    setShowDialog(true);
    setTextCompleted(false);
  };

  // Handle dialog close
  const handleCloseInfo = () => {
    setShowDialog(false);
    setTextCompleted(false);
  };

  // Handle text completion
  const handleTextComplete = () => {
    setTextCompleted(true);
  };

  // Handle keyboard events for dialog control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && textCompleted && showDialog) {
        e.preventDefault();
        handleCloseInfo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [textCompleted, showDialog]);

  return {
    selectedPlanet,
    discoveredPlanets,
    showDialog,
    textCompleted,
    handlePlanetClick,
    handleCloseInfo,
    handleTextComplete,
  };
}
