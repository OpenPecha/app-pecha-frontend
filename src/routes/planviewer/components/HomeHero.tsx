import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { FiArrowRight } from "react-icons/fi";
import { fetchVerseOfDayToday } from "../api/plansApi.ts";
import VerseOfDayCard from "./VerseOfDayCard.tsx";

type HomeHeroProps = {
  apiLanguage: string;
};

/**
 * The home page hero: today's verse image full-bleed, with what this site is
 * over the top of it.
 *
 * The verse used to be the whole hero - a half-screen image that never said what
 * WeBuddhist is - and the masthead that replaced it left the image with nowhere
 * to go. This carries both: the image sets the mood, the headline states the
 * case, and the verse itself sits alongside as the day's note.
 *
 * The verse query is shared with VerseOfDayCard below; react-query serves both
 * from one request under the same key.
 */
const HomeHero = ({ apiLanguage }: HomeHeroProps) => {
  const { t } = useTranslate();

  const { data } = useQuery(
    ["verse-of-day", apiLanguage],
    () => fetchVerseOfDayToday(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const imageUrl = data?.verse_of_day?.image_url;

  return (
    <header className="relative isolate overflow-hidden bg-[#102544]">
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/*
        Weighted to the lower left, where the headline sits, so the type stays
        legible over whatever photograph is published that day.
      */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1729]/95 via-[#0a1729]/70 to-[#0a1729]/30" />

      <div className="relative mx-auto flex min-h-[clamp(26rem,68vh,40rem)] w-full max-w-6xl flex-col justify-end gap-10 px-4 pb-12 pt-24 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-16">
        <div className="max-w-3xl">
          {/*
            No wordmark here: the bar above is transparent over this image, so
            the logo is already sitting in the corner.

            Bold sans for the claim, italic serif for the turn at the end - the
            serif is the same face the reader sets its texts in.
          */}
          <h1 className="text-[2rem] leading-[1.1] text-white sm:text-5xl lg:text-6xl">
            <span className="font-semibold tracking-tight">
              {t("home.masthead_lead", "We learn, practice and connect.")}
            </span>{" "}
            <span className="en-serif-text italic text-white/90">
              {t("home.masthead_accent", "Daily.")}
            </span>
          </h1>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/collections"
              className="group inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-[#102544] transition hover:bg-white/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1729]"
            >
              {t("home.read_the_texts", "Read the texts")}
              <span className="flex size-7 items-center justify-center rounded-full bg-[#102544] text-white transition group-hover:translate-x-0.5">
                <FiArrowRight aria-hidden="true" />
              </span>
            </Link>
            {/*
              Was an in-page anchor to #practices, which stopped working when
              the listings moved off "/" and took that section with them.
            */}
            <Link
              to="/plans"
              className="rounded-full border border-white/30 px-6 py-2.5 text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a1729]"
            >
              {t("home.browse_practices", "Browse practices")}
            </Link>
          </div>
        </div>

        {/* The day's note, kept small and set to the side. */}
        <VerseOfDayCard apiLanguage={apiLanguage} />
      </div>
    </header>
  );
};

export default HomeHero;
