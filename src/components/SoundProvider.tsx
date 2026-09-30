import { useEffect, type ReactNode } from "react";
import { initializeSounds } from "@/lib/interactionSounds";

export function SoundProvider({ children }: { children: ReactNode }) {
  useEffect(() => initializeSounds(), []);
  return children;
}
