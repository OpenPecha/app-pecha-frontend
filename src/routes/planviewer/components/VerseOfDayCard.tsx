import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchVerseOfDayToday } from "../api/plansApi.ts";
import { getVerseAttribution, getVerseText } from "../utils/seriesUtils.ts";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";
import { useState } from "react";

type VerseOfDayCardProps = {
  apiLanguage: string;
};

/**
 * The verse of the day, as the note set beside the hero headline.
 *
 * It is no longer a card: the hero's background *is* this verse's image, so a
 * bordered box on top of it would only fight the photograph. Small, light type
 * set to one side reads as a caption on the image rather than a widget over it.
 *
 * Shares its query with HomeHero, which uses the same key for the image.
 */
const VerseOfDayCard = ({ apiLanguage }: VerseOfDayCardProps) => {
  const { t } = useTranslate();
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery(
    ["verse-of-day", apiLanguage],
    () => fetchVerseOfDayToday(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const verse = data?.verse_of_day;

  if (isLoading) {
    return (
      <div className="w-full animate-pulse space-y-2 lg:w-64 lg:shrink-0">
        <div className="h-2.5 w-28 rounded-full bg-white/25" />
        <div className="h-3 w-full rounded-full bg-white/20" />
        <div className="h-3 w-4/5 rounded-full bg-white/15" />
      </div>
    );
  }

  if (!verse) return null;

  const verseText = getVerseText(verse.verses, verse.verse, apiLanguage);
  if (!verseText) return null;
  const verseAttribution = getVerseAttribution(verse.group_info, apiLanguage);
  const isTibetan = getLanguageClass(apiLanguage) === "bo-text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; fail silently.
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCopy();
    }
  };

  return (
    <section
      className="w-full lg:w-64 lg:shrink-0"
      aria-label={t("plans.verse_of_day", "Verse of the day")}
    >
      <button
        type="button"
        className="block w-full cursor-pointer border-t border-white/25 pt-4 text-left lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
        title={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        aria-label={t("plans.copy_to_clipboard", "Copy verse to clipboard")}
      >
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55">
          {t("plans.verse_of_day", "Verse of the day")}
        </p>
        <blockquote
          className={`mt-3 text-sm leading-relaxed text-white/90 ${getLanguageClass(
            apiLanguage,
          )} ${isTibetan ? "" : "en-serif-text"}`}
        >
          {verseText}
        </blockquote>
        {verseAttribution && (
          <p className="mt-2 text-xs capitalize text-white/55">
            — {verseAttribution}
          </p>
        )}
        <p
          className={`mt-2 text-xs font-medium text-white transition-opacity ${
            copied ? "opacity-100" : "opacity-0"
          }`}
          aria-live="polite"
        >
          {t("plans.copied", "Copied!")}
        </p>
      </button>
    </section>
  );
};

export default VerseOfDayCard;
