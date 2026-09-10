import { useEffect, useRef, useState } from "react";

/** Tailwind's `lg` breakpoint, where the sections become two columns. */
const LARGE_SCREEN = 1024;

/**
 * Drifts an element against the page as it scrolls.
 *
 * Put `measureRef` on a wrapper and `style` on a child inside it. They must be
 * different elements: getBoundingClientRect() reports the *transformed* box, so
 * measuring the node being moved makes each reading include the offset it was
 * just given, and the position chases itself instead of tracking the page.
 *
 * The offset comes from how far the wrapper's centre sits from the centre of the
 * viewport, so it settles at zero when the section is the thing being read and
 * drifts as it enters and leaves - rather than growing with absolute scroll
 * position, which sends elements wandering as a page gets longer.
 *
 * Reads are batched into an animation frame. The effect is skipped entirely for
 * anyone who has asked for reduced motion, and on screens narrower than
 * `minWidth`, where the sections stack into one column and there is no second
 * column to drift.
 *
 * @param strength Fraction of the viewport height travelled across a full pass.
 * @param minWidth Width below which the effect is left off entirely.
 */
export const useParallax = <T extends HTMLElement>(
  strength = 0,
  minWidth = LARGE_SCREEN,
) => {
  const measureRef = useRef<T>(null);
  const [offset, setOffset] = useState(0);
  const [isWideEnough, setIsWideEnough] = useState(false);

  // Tracked in state rather than read once, so that crossing the breakpoint -
  // rotating a tablet, dragging a window wider - re-runs the effect below
  // instead of leaving the drift stuck on or off.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia(`(min-width: ${minWidth}px)`);
    const sync = () => setIsWideEnough(query.matches);

    sync();
    query.addEventListener?.("change", sync);
    return () => query.removeEventListener?.("change", sync);
  }, [minWidth]);

  useEffect(() => {
    const element = measureRef.current;
    if (!element || strength === 0 || !isWideEnough) {
      setOffset(0);
      return;
    }

    if (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (!viewportHeight) return;
      // -0.5 above the fold, 0 dead centre, +0.5 below it.
      const distanceFromCentre =
        (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      setOffset(distanceFromCentre * strength * viewportHeight);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [strength, isWideEnough]);

  return {
    measureRef,
    style: offset
      ? { transform: `translate3d(0, ${offset.toFixed(2)}px, 0)` }
      : undefined,
  };
};
