import { render, screen } from "@testing-library/react";
import { motion } from "motion/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { useParallax } from "./useParallax.ts";

/** Mirrors how IntroSection uses the hook: measure outside, transform inside. */
const Drifter = ({ strength }: { strength: number }) => {
  const drift = useParallax<HTMLDivElement>(strength);
  return (
    <div data-testid="measured" ref={drift.measureRef}>
      <motion.div data-testid="drifter" style={drift.style} />
    </div>
  );
};

/** Answers both queries the hook asks: reduced motion, and the width gate. */
const setMedia = ({ reduce = false, wide = true } = {}) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduce : wide,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
};

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  setMedia();
});

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe("useParallax", () => {
  test("hands the panel a transform to drift with", () => {
    render(<Drifter strength={0.25} />);

    // Motion owns the scroll tracking; the hook's part is turning a strength
    // into a translation the panel can carry.
    expect(screen.getByTestId("drifter")).toHaveAttribute("style");
    expect(screen.getByTestId("drifter").getAttribute("style")).toContain(
      "transform",
    );
  });

  test("travels the given fraction of the viewport, in vh", () => {
    render(<Drifter strength={0.25} />);

    // vh rather than pixels, so the drift is a share of the screen and a resize
    // needs no remeasuring.
    expect(screen.getByTestId("drifter").getAttribute("style")).toContain(
      "25vh",
    );
  });

  test("does nothing at zero strength, so a section can opt out", () => {
    render(<Drifter strength={0} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("does nothing for a reader who asked for reduced motion", () => {
    setMedia({ reduce: true });

    render(<Drifter strength={0.25} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("does nothing on a narrow screen, where the columns stack", () => {
    setMedia({ wide: false });

    render(<Drifter strength={0.25} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("never transforms the element it measures", () => {
    // The measured node is the fixed point the drift is calculated against, so
    // moving it would fold each offset back into the next reading.
    render(<Drifter strength={0.25} />);

    expect(screen.getByTestId("measured")).not.toHaveAttribute("style");
    expect(screen.getByTestId("drifter")).toHaveAttribute("style");
  });
});
