import { useCallback, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useTolgee, useTranslate } from "@tolgee/react";
import { FiArrowRight } from "react-icons/fi";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import HomeHero from "../planviewer/components/HomeHero.tsx";
import IntroSection from "./IntroSection.tsx";
import RandomMala from "./RandomMala.tsx";
import PartnerMarquee from "./PartnerMarquee.tsx";
import RandomPlanImage from "./RandomPlanImage.tsx";
import GroupsMosaic from "./GroupsMosaic.tsx";
import Seo from "../commons/seo/Seo.tsx";
import DownloadAppModal from "../../components/DownloadAppModal.tsx";
import { LANGUAGE, siteDescription, siteName } from "../../utils/constants.ts";
import {
  apiLanguageParam,
  tolgeeToPlanLanguage,
} from "../planviewer/utils/seriesUtils.ts";
import {
  isMobileDevice,
  openAppDownloadPage,
} from "../../utils/deviceUtils.ts";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion.ts";

/** Query keys the practice area reads; "/" used to serve these views itself. */
const PRACTICE_PARAMS = ["series", "plan", "group", "accumulator", "view"];

const primaryAction =
  "group inline-flex items-center gap-3 rounded-full bg-[#102544] py-2 pl-6 pr-2 text-sm font-semibold text-white transition hover:bg-[#0c1c34] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#102544]/50 focus-visible:ring-offset-2";

const ActionArrow = () => (
  <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
    <FiArrowRight aria-hidden="true" />
  </span>
);

/**
 * The front page: what this app is for, rather than everything it contains.
 *
 * Plans, mala and groups each get an introduction here and live in their own
 * parts of the app - the listings moved to /plans when this page took over "/".
 */
const Home = () => {
  const { t } = useTranslate();
  const tolgee = useTolgee(["language"]);
  const [searchParams] = useSearchParams();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  const storedLanguage =
    tolgee.getLanguage() || localStorage.getItem(LANGUAGE) || "en";
  const apiLanguage = apiLanguageParam(storedLanguage);
  const planLanguage = tolgeeToPlanLanguage(storedLanguage);

  const handleOpenApp = useCallback(() => {
    if (isMobileDevice()) {
      openAppDownloadPage();
      return;
    }
    setDownloadModalOpen(true);
  }, []);

  // Links made before the practice area moved off "/" still work.
  const hasPracticeParams = PRACTICE_PARAMS.some((key) =>
    searchParams.get(key),
  );
  if (hasPracticeParams) {
    return <Navigate to={`/plans?${searchParams.toString()}`} replace />;
  }

  return (
    /*
      Lenis eases the wheel rather than letting the page jump a notch at a time,
      which is what makes the pinned sections read as one sliding over another.
      It keeps the document's own scroll - no transformed wrapper - so the
      `position: sticky` those sections rely on still works, and `root` renders
      no element of its own.

      Mounted here rather than around the whole app: Lenis takes over the wheel
      wherever it is active, and the reader's panels elsewhere scroll on their
      own. Turning off `smoothWheel` hands the wheel straight back to the
      browser for anyone who has asked for reduced motion.
    */
    <ReactLenis root options={{ smoothWheel: !prefersReducedMotion }}>
      <Seo
        title={siteName}
        description={siteDescription}
        canonical={`${window.location.origin}/`}
      />
      <div className="bg-[#f4f6f8]">
        {/*
          Locked to one viewport at every width: the hero is shorter than the
          window and the marquee takes the rest, so the first screen always
          ends on the community. Below lg this used to be only min-h-dvh, which
          let the hero fill the window and push the strip off-screen.
        */}
        <div className="flex h-dvh flex-col">
          <HomeHero apiLanguage={apiLanguage} />
          <PartnerMarquee apiLanguage={apiLanguage} language={planLanguage} />
        </div>

        <IntroSection
          background="bg-[#f4f6f8]"
          eyebrow={t("header.plans", "Plans")}
          title={
            <>
              {t("home.plans_heading_lead", "A practice that")}{" "}
              <span className="en-serif-text italic">
                {t("home.plans_heading_accent", "keeps its place")}
              </span>
            </>
          }
          body={t(
            "home.plans_body",
            "A plan sets out what to read or recite each day and remembers where you left off, so a long text becomes something you can actually get through. Follow one over a week or over a year, at whatever pace the days allow.",
          )}
          panel={
            <RandomPlanImage
              apiLanguage={apiLanguage}
              language={planLanguage}
            />
          }
          action={
            <Link to="/plans" className={primaryAction}>
              {t("home.plans_action", "See the plans")}
              <ActionArrow />
            </Link>
          }
        />

        <IntroSection
          reversed
          parallax
          background="bg-gradient-to-b from-[#fdfaf4] via-[#f8f0e3] to-[#fdfaf4]"
          eyebrow={t("mantras.preset_mantras", "Mala")}
          title={
            <>
              {t("home.mala_heading_lead", "Recitation, counted")}{" "}
              <span className="en-serif-text italic">
                {t("home.mala_heading_accent", "bead by bead")}
              </span>
            </>
          }
          body={t(
            "home.mala_body",
            "A mala keeps the count so you do not have to. Choose a mantra, recite, and the tally carries over from one sitting to the next — on its own or towards a number you have set yourself. Counting happens in the mobile app.",
          )}
          panel={
            <RandomMala
              apiLanguage={apiLanguage}
              language={planLanguage}
              onOpenApp={handleOpenApp}
            />
          }
          action={
            <button
              type="button"
              onClick={handleOpenApp}
              className={primaryAction}
            >
              {t("home.mala_action", "Get the app")}
              <ActionArrow />
            </button>
          }
        />

        <IntroSection
          parallax
          background="bg-gradient-to-b from-[#f1f5fb] via-[#e6edf6] to-[#f1f5fb]"
          eyebrow={t("mantras.joinable_groups", "Groups")}
          title={
            <>
              {t("home.groups_heading_lead", "Practise")}{" "}
              <span className="en-serif-text italic">
                {t("home.groups_heading_accent", "alongside others")}
              </span>
            </>
          }
          body={t(
            "home.groups_body",
            "A group pools what everyone recites into one shared count, so an accumulation that would take one person years takes a community a season. Join an open group, or keep to your own and simply see the total climb.",
          )}
          panel={
            <GroupsMosaic apiLanguage={apiLanguage} language={planLanguage} />
          }
          action={
            <Link to="/plans?view=groups" className={primaryAction}>
              {t("home.groups_action", "Find a group")}
              <ActionArrow />
            </Link>
          }
        />
      </div>
      <DownloadAppModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </ReactLenis>
  );
};

export default Home;
