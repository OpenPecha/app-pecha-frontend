import React from "react";
import { useParallax } from "./useParallax.ts";

type IntroSectionProps = {
  /** Small italic label, e.g. "Plans". */
  eyebrow: string;
  /** Accepts nodes so a clause can be set in italic serif against the sans. */
  title: React.ReactNode;
  body: string;
  /**
   * What fills the panel. A word set in the reader's serif by default, or a
   * piece of real content where there is one worth showing.
   */
  panel: React.ReactNode;
  action: React.ReactNode;
  /** Puts the panel on the left, so consecutive sections alternate. */
  reversed?: boolean;
  /** Drifts the panel against the page as the section scrolls past. */
  parallax?: boolean;
  /**
   * Full-bleed background for the section. Each one differs so the boundaries
   * are visible - a panel drifting against an unbroken field has nothing to
   * drift against.
   */
  background?: string;
};

/**
 * One of the three things this app is for, explained.
 *
 * The home page introduces plans, mala and groups rather than listing what is
 * in them - the listings live in their own parts of the app. Each takes a full
 * screen, so one thing is being said at a time, and they alternate sides so
 * three in a row do not read as three identical bands.
 */
const IntroSection = ({
  eyebrow,
  title,
  body,
  panel,
  action,
  reversed = false,
  parallax = false,
  background = "",
}: IntroSectionProps) => {
  // A quarter of the viewport across a full pass. A tenth was too slight to
  // read as movement at all next to the page scrolling past it.
  const drift = useParallax<HTMLDivElement>(parallax ? 0.25 : 0);

  return (
    // Pinned on large screens so the next section rides up over this one; later
    // sections paint over earlier ones simply by coming later in the document.
    // Below lg the sections are taller than the viewport, where pinning would
    // strand whatever did not fit, so they scroll normally.
    <section
      className={`flex min-h-dvh items-center py-20 lg:sticky lg:top-0 lg:h-dvh ${background}`}
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div className={reversed ? "lg:order-2" : undefined}>
          <p className="en-serif-text text-lg italic text-slate-500">
            {eyebrow} —
          </p>
          <h2 className="mt-2 text-2xl font-semibold leading-[1.15] tracking-tight text-[#102544] sm:text-3xl lg:text-[2.5rem]">
            {title}
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-slate-600">
            {body}
          </p>
          <div className="mt-7">{action}</div>
        </div>

        {/*
          No panel container: a bordered, rounded box beside the text made every
          section read as a card, so the content sits straight on the page.

          Two elements on purpose: the outer one is measured and never moves,
          the inner one carries the transform. Measuring a transformed node
          returns the moved box, so the reading would include its own offset.
        */}
        <div
          ref={drift.measureRef}
          className={reversed ? "lg:order-1" : undefined}
        >
          <div style={drift.style} className="will-change-transform">
            {panel}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
