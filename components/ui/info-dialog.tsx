"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

interface InfoDialogProps {
  planetName: string;
  description: string;
  visible: boolean;
  textCompleted: boolean;
  onTextComplete: () => void;
}

export function InfoDialog({
  planetName,
  description,
  visible,
  textCompleted,
  onTextComplete,
}: InfoDialogProps) {
  const [displayText, setDisplayText] = useState("");
  const textIndex = useRef(0);
  const animationRef = useRef<number>(0);

  // Reset and start typing effect when dialog becomes visible or text changes
  useEffect(() => {
    if (visible) {
      textIndex.current = 0;
      setDisplayText("");

      const typeText = () => {
        if (textIndex.current < description.length) {
          setDisplayText((prev) => prev + description[textIndex.current]);
          textIndex.current++;
          animationRef.current = requestAnimationFrame(typeText);
        } else {
          onTextComplete();
        }
      };

      // Start typing animation
      animationRef.current = requestAnimationFrame(typeText);

      // Cleanup animation
      return () => {
        cancelAnimationFrame(animationRef.current);
      };
    }
  }, [visible, description, onTextComplete]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed bottom-0 left-0 right-0 w-full pointer-events-auto z-50"
      >
        <Card className="rounded-t-xl p-6 bg-black/85 text-white border-2 border-cyan-400 backdrop-blur-xl">
          <h3 className="text-3xl font-bold mb-3 text-cyan-300">
            {planetName}
            <span className="ml-2 text-xl">
              {planetName === "Sun"
                ? "⭐"
                : planetName === "Moon"
                ? "🌙"
                : "🪐"}
            </span>
          </h3>
          <p className="text-xl text-white leading-relaxed mb-5">
            {displayText}
          </p>

          {textCompleted && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-base text-cyan-400 mt-4 text-center font-bold"
            >
              Tekan SPACE untuk menutup
            </motion.p>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
