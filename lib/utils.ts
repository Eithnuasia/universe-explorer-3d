import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getModelPath(modelPath: string): string {
  // Use basePath from next.config.js when in production
  const basePath =
    process.env.NODE_ENV === "production" ? "/universe-explorer-3d" : "";
  return `${basePath}${modelPath}`;
}

export function getSoundPath(soundPath: string): string {
  // Use basePath from next.config.js when in production
  const basePath =
    process.env.NODE_ENV === "production" ? "/universe-explorer-3d" : "";
  return `${basePath}${soundPath}`;
}
