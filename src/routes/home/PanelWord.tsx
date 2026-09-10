import React from "react";

/**
 * The category name set large in the reader's serif.
 *
 * Each intro panel prefers real content - a plan's artwork, a mala, the wall of
 * group avatars - and falls back to this when there is none to show, so a panel
 * is never an empty coloured box.
 */
const PanelWord = ({ children }: { children: React.ReactNode }) => (
  <span className="en-serif-text px-6 text-center text-3xl italic text-[#102544]/70 sm:text-4xl lg:text-5xl">
    {children}
  </span>
);

export default PanelWord;
