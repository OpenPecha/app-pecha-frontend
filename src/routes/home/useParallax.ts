import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion.ts";

/** Tailwind's `lg` breakpoint, where the sections become two columns. */
const LARGE_SCREEN = 1024;

const isAtLeast = (minWidth: number) =>
  typeof window.matchMedia === "function" &&
  window.matchMedia(`(min-width: ${minWidth}px)`).matches;

/**
 * Drifts an element against the page as it scrolls.
 *
 * Put `measureRef` on a wrapper and spread `style` on a `motion.div` inside it.
 * They must be different elements: the wrapper is what gets measured, and a
 * transformed node would report the box it was just moved to.
 *
 * Motion tracks the wrapper's pass through the viewport as a 0-1 progress and
 * maps it onto a translation in `vh`, so the drift is a fraction of the screen
 * rather than of the panel, and survives a resize without remeasuring. The
 * progress comes from the wrapper's layout position (its offsetTop chain), not
 * its painted position, so it keeps advancing while the section is held in
 * place by `position: sticky` - which is exactly when these sections are on
 * screen.
 *
 * The effect is left off entirely for anyone who has asked for reduced motion,
 * and on screens narrower than `minWidth`, where the sections stack into one
 * column and there is no second column to drift.
 *
 * @param strength Fraction of the viewport height travelled in each direction.
 * @param minWidth Width below which the effect is left off entirely.
 */
export const useParallax = <T extends HTMLElement>(
  strength = 0,
  minWidth = LARGE_SCREEN,
) => {
  const measureRef = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  // Read on the first render, so the panel is handed its transform before it
  // paints rather than a frame later. Kept in state as well, so that crossing
  // the breakpoint - rotating a tablet, dragging a window wider - turns the
  // drift on or off instead of leaving it stuck as it was at first paint.
  const [isWideEnough, setIsWideEnough] = useState(() => isAtLeast(minWidth));

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setIsWideEnough(query.matches);

    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, [minWidth]);

  // 0 as the wrapper enters at the bottom of the screen, 1 as it leaves the top.
  const { scrollYProgress } = useScroll({
    target: measureRef,
    offset: ["start end", "end start"],
  });

  const travel = strength * 100;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${travel}vh`, `${-travel}vh`],
  );

  const isDrifting = strength !== 0 && isWideEnough && !prefersReducedMotion;

  return { measureRef, style: isDrifting ? { y } : undefined };
};
