import { render, screen, act } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom";
import { useParallax } from "./useParallax.ts";

/** Mirrors how IntroSection uses the hook: measure outside, transform inside. */
const Drifter = ({ strength }: { strength: number }) => {
  const drift = useParallax<HTMLDivElement>(strength);
  return (
    <div data-testid="measured" ref={drift.measureRef}>
      <div data-testid="drifter" style={drift.style} />
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

/** Place the element's centre a given fraction of a viewport below centre. */
const positionAt = (fractionBelowCentre: number) => {
  const height = 100;
  const top =
    window.innerHeight / 2 +
    fractionBelowCentre * window.innerHeight -
    height / 2;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 100,
    x: 0,
    y: top,
    toJSON: () => ({}),
  });
};

beforeEach(() => {
  setMedia();
  window.innerHeight = 800;
  // Run scheduled frames straight away so a scroll settles within the test.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useParallax", () => {
  test("offsets an element by how far it sits from the middle of the view", () => {
    positionAt(0.5);

    render(<Drifter strength={0.1} />);

    // Half a viewport below centre, at a tenth strength: 0.5 * 0.1 * 800 = 40px.
    expect(screen.getByTestId("drifter")).toHaveStyle({
      transform: "translate3d(0, 40.00px, 0)",
    });
  });

  test("settles at no offset when the element is centred", () => {
    positionAt(0);

    render(<Drifter strength={0.1} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("drifts the other way above the fold", () => {
    positionAt(-0.5);

    render(<Drifter strength={0.1} />);

    expect(screen.getByTestId("drifter")).toHaveStyle({
      transform: "translate3d(0, -40.00px, 0)",
    });
  });

  test("does nothing at zero strength, so a section can opt out", () => {
    positionAt(0.5);

    render(<Drifter strength={0} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("does nothing for a reader who asked for reduced motion", () => {
    setMedia({ reduce: true });
    positionAt(0.5);

    render(<Drifter strength={0.1} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("recomputes on scroll", () => {
    positionAt(0);
    render(<Drifter strength={0.1} />);
    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");

    positionAt(0.5);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(screen.getByTestId("drifter")).toHaveStyle({
      transform: "translate3d(0, 40.00px, 0)",
    });
  });

  test("never transforms the element it measures", () => {
    // getBoundingClientRect reports the transformed box, so moving the measured
    // node would fold each offset back into the next reading.
    positionAt(0.5);

    render(<Drifter strength={0.1} />);

    expect(screen.getByTestId("measured")).not.toHaveAttribute("style");
    expect(screen.getByTestId("drifter")).toHaveAttribute("style");
  });

  test("does nothing on a narrow screen, where the columns stack", () => {
    setMedia({ wide: false });
    positionAt(0.5);

    render(<Drifter strength={0.1} />);

    expect(screen.getByTestId("drifter")).not.toHaveAttribute("style");
  });

  test("stops listening once the section unmounts", () => {
    positionAt(0);
    const removeListener = vi.spyOn(window, "removeEventListener");

    const { unmount } = render(<Drifter strength={0.1} />);
    unmount();

    const events = removeListener.mock.calls.map(([event]) => event);
    expect(events).toContain("scroll");
    expect(events).toContain("resize");
  });
});
