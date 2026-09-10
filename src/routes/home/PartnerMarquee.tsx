import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPublicGroups } from "../mantras/api/accumulatorApi.ts";
import { getGroupTitleForLanguage } from "../mantras/utils/groupUtils.ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PlanLanguageCode } from "../planviewer/utils/seriesUtils.ts";

type PartnerMarqueeProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
};

/** How many partners to pull for the strip. */
const PARTNER_LIMIT = 50;

/** Below this there is too little to loop convincingly, so it sits still. */
const MINIMUM_TO_ANIMATE = 8;

const initialsOf = (title: string) =>
  title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("") || "·";

/**
 * A slow strip of the groups practising here, filling the band below the hero.
 *
 * The hero is deliberately shorter than the window; this takes the rest, so the
 * first screen ends on the community rather than on empty space.
 *
 * The list is rendered twice: the track travels exactly half its own width, at
 * which point the second copy sits where the first started, so the loop has no
 * seam. Only the first copy is announced - the duplicate is decorative.
 */
const PartnerMarquee = ({ apiLanguage, language }: PartnerMarqueeProps) => {
  const { t } = useTranslate();

  const { data } = useQuery(
    ["public-groups-marquee", apiLanguage],
    () => fetchPublicGroups(apiLanguage, PARTNER_LIMIT),
    { refetchOnWindowFocus: false },
  );

  const groups = data?.groups ?? [];
  if (groups.length === 0) return null;

  const shouldAnimate = groups.length >= MINIMUM_TO_ANIMATE;
  // Keep the pace even however many partners there are, rather than whipping
  // through a short list and crawling through a long one.
  const duration = `${Math.max(30, groups.length * 3)}s`;

  const renderRun = (ariaHidden: boolean) => (
    <ul
      className="flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10"
      aria-hidden={ariaHidden || undefined}
    >
      {groups.map((group) => {
        const title = getGroupTitleForLanguage(group.metadata, language);
        return (
          <li key={group.id} className="shrink-0">
            <Avatar
              className="size-12 ring-1 ring-white/25 sm:size-14"
              title={title}
            >
              {group.avatar_url && (
                <AvatarImage
                  src={group.avatar_url}
                  alt={ariaHidden ? "" : title}
                />
              )}
              <AvatarFallback className="bg-white/10 text-xs font-semibold text-white/80">
                {initialsOf(title)}
              </AvatarFallback>
            </Avatar>
          </li>
        );
      })}
    </ul>
  );

  return (
    <section
      className="flex min-h-28 flex-[0_0_20%] flex-col justify-center gap-3 overflow-hidden bg-[#0a1729] py-3 lg:pb-14"
      aria-label={t("home.partners_label", "Groups practising with us")}
    >
      <p className="px-4 mb-4 text-center text-[0.65rem] font-semibold uppercase  tracking-[0.24em] text-white/40 sm:px-6">
        {t("home.partners_label", "Groups practising with us")}
      </p>

      {/* Fades the strip out at both edges instead of cutting it off. */}
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div
          className={`flex w-max ${shouldAnimate ? "partner-marquee-track" : "justify-center"}`}
          style={
            shouldAnimate
              ? ({ "--marquee-duration": duration } as React.CSSProperties)
              : undefined
          }
        >
          {renderRun(false)}
          {shouldAnimate && renderRun(true)}
        </div>
      </div>
    </section>
  );
};

export default PartnerMarquee;
