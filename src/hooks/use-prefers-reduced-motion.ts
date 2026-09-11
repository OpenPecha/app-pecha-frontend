import { useEffect, useState } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const asksForLessMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(REDUCED_MOTION).matches;

/**
 * Whether the reader has asked their system for less movement.
 *
 * Tracked in state rather than read once, so that changing the setting takes
 * effect without a reload. Motion ships a `useReducedMotion` of its own, but it
 * reads a module-level singleton once and never updates, so this stays here and
 * both the marquee and the parallax use it.
 */
export const usePrefersReducedMotion = () => {
  // Read on the first render rather than in the effect, so nothing animates for
  // a frame before being switched off.
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState(asksForLessMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(REDUCED_MOTION);
    const sync = () => setPrefersReducedMotion(query.matches);

    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, []);

  return prefersReducedMotion;
};
