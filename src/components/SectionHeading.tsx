import React from "react";

type SectionHeadingProps = {
  /** Small italic label above the title, e.g. "Practice Routines". */
  eyebrow?: string;
  /** Accepts nodes so a clause can be set in italic serif against the sans. */
  title: React.ReactNode;
  /** Supporting copy, set beside the title on wide screens. */
  description?: string;
  /** Optional control under the description, e.g. a "See all" link. */
  action?: React.ReactNode;
};

/**
 * The heading for a band on the home page.
 *
 * Each band used to style its own, so the page read as three variations on one
 * idea. This is the editorial arrangement the hero sets up: an italic serif
 * label, a large sans heading that can turn to italic serif mid-phrase, and the
 * supporting copy pulled out to its own column rather than stacked underneath.
 */
const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) => (
  <header className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-12">
    <div>
      {eyebrow && (
        <p className="en-serif-text text-lg italic text-slate-500">
          {eyebrow} —
        </p>
      )}
      <h2 className="mt-2 text-2xl font-semibold leading-[1.15] tracking-tight text-[#102544] sm:text-3xl lg:text-[2.5rem]">
        {title}
      </h2>
    </div>

    {(description || action) && (
      <div className="lg:pt-2">
        {description && (
          <p className="text-[0.95rem] leading-relaxed text-slate-600">
            {description}
          </p>
        )}
        {action && <div className="mt-5">{action}</div>}
      </div>
    )}
  </header>
);

export default SectionHeading;
