import pechaLogo from "../assets/icons/pecha_icon.png";
import { languageMap } from "./constants.ts";

export const getFirstSegmentId = (sections: any[]): string | null => {
  if (!sections?.length) {
    return null;
  }
  const [firstSection] = sections;
  return (
    getFirstSegmentId(firstSection.sections) ??
    firstSection.segments?.[0]?.segment_id ??
    null
  );
};

export const getLastSegmentId = (sections: any[]): string | null => {
  if (!sections?.length) {
    return null;
  }
  const lastSection = sections.at(-1);
  return (
    getLastSegmentId(lastSection.sections) ??
    lastSection.segments?.at(-1)?.segment_id ??
    null
  );
};

/**
 * The first/last segment objects of a page, so callers can read a segment's
 * position as well as its id. Knowing the position lets the reader ask for the
 * next window directly instead of making the library locate the anchor segment.
 */
export const getFirstSegment = (sections: any[]): any | null => {
  if (!sections?.length) {
    return null;
  }
  const [firstSection] = sections;
  return (
    getFirstSegment(firstSection.sections) ?? firstSection.segments?.[0] ?? null
  );
};

export const getLastSegment = (sections: any[]): any | null => {
  if (!sections?.length) {
    return null;
  }
  const lastSection = sections.at(-1);
  return (
    getLastSegment(lastSection.sections) ?? lastSection.segments?.at(-1) ?? null
  );
};

export const getEarlyReturn = ({
  isLoading,
  error,
  t,
}: {
  isLoading: boolean;
  error: any;
  t: any;
}) => {
  if (isLoading) {
    return (
      <div className=" w-full h-svh flex flex-col justify-center items-center">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className=" w-full h-svh flex flex-col justify-center items-center">
        <img src={pechaLogo} alt="Not Found" width={100} height={100} />
        <div className="no-content">{t("global.not_found")}</div>
      </div>
    );
  }

  return null;
};

export const getSearchErrorMessage = (error: any, t: any): string => {
  const status = error?.response?.status;
  const messages: Record<number, string> = {
    404: t("search.zero_result", "No results to display."),
    429: t(
      "search.too_many_requests",
      "Too many requests. Please wait and try again.",
    ),
    503: t(
      "search.service_unavailable",
      "Service temporarily unavailable. Please try again.",
    ),
  };
  return (
    messages[status] ||
    t("search.generic_error", "Something went wrong. Please try again.")
  );
};

export const mapLanguageCode = (languageCode: string): string => {
  const languageMap = {
    en: "en",
    "zh-Hans-CN": "zh",
    "bo-IN": "bo",
    bo: "bo",
    zh: "zh",
  };
  return (
    languageMap[languageCode as keyof typeof languageMap] || languageMap.en
  );
};
/**
 * Resolves an API language code to its Tolgee label key. Handles region-tagged
 * codes ("bo-IN") and casing. Returns null when the code has no label, so
 * callers can fall back to showing the raw code instead of a blank badge.
 */
export const getLanguageLabelKey = (
  language?: string | null,
): string | null => {
  if (!language) return null;
  const normalized = language.trim().toLowerCase().replace(/_/g, "-");
  const base = normalized.split("-")[0];
  const key = languageMap as Record<string, string | undefined>;
  return key[normalized] ?? key[base] ?? null;
};

export const getLanguageClass = (language?: string | null): string => {
  if (!language) return "en-serif-text";
  if (language === "en-san") return "en-text";

  const upper = language.trim().toUpperCase();
  const normalized =
    upper === "BO" || upper === "EN" || upper === "ZH"
      ? upper.toLowerCase()
      : mapLanguageCode(language);

  switch (language) {
    case "sa":
    case "bhu":
    case "tib":
      return "bo-text";
  }

  switch (normalized) {
    case "bo":
      return "bo-text";
    case "en":
      return "en-serif-text";
    case "sa":
      return "bo-text";
    case "bhu":
      return "bo-text";
    case "tib":
      return "bo-text";
    case "zh":
      return "zh-text";
    case "it":
      return "en-serif-text";
    default:
      return "en-serif-text";
  }
};

export const mergeSections = (
  existingSections: any[],
  newSections: any[],
): any[] => {
  if (!existingSections || existingSections.length === 0) return newSections;
  if (!newSections || newSections.length === 0) return existingSections;

  const mergedSections = [...existingSections];
  newSections.forEach((newSection) => {
    const existingIndex = mergedSections.findIndex(
      (section) => section.id === newSection.id,
    );
    if (existingIndex !== -1) {
      const existingSection = mergedSections[existingIndex];
      // Merge segments
      const mergedSegments = [...(existingSection.segments || [])];
      (newSection.segments || []).forEach((newSegment: any) => {
        if (
          !mergedSegments.some(
            (segment) => segment.segment_id === newSegment.segment_id,
          )
        ) {
          mergedSegments.push(newSegment);
        }
      });
      // Merge nested sections recursively
      const mergedNestedSections = mergeSections(
        existingSection.sections || [],
        newSection.sections || [],
      );
      mergedSections[existingIndex] = {
        ...existingSection,
        segments: mergedSegments,
        sections: mergedNestedSections,
      };
    } else {
      mergedSections.push(newSection);
    }
  });
  return mergedSections;
};

export const getCurrentSectionFromScroll = (
  sections: any[],
  containerRect: any,
  sectionRefs: any,
): string | null => {
  if (!sections || sections.length === 0) return null;

  const flatSections: any[] = [];
  const walk = (secs: any[], depth = 0) => {
    secs.forEach((sec: any) => {
      flatSections.push({ sec, depth });
      if (sec.sections && sec.sections.length > 0) {
        walk(sec.sections, depth + 1);
      }
    });
  };
  walk(sections);

  let candidateBelow = { id: null, dist: Infinity, depth: -1 };
  let candidateAbove = { id: null, dist: Infinity, depth: -1 };

  flatSections.forEach(({ sec, depth }) => {
    const element = sectionRefs.current?.get(sec.id);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= containerRect.top || rect.top >= containerRect.bottom)
      return;
    const offsetFromTop = rect.top - containerRect.top;
    if (offsetFromTop >= 0) {
      const isCloser = offsetFromTop < candidateBelow.dist;
      const isSameDistButDeeper =
        offsetFromTop === candidateBelow.dist && depth > candidateBelow.depth;
      if (isCloser || isSameDistButDeeper) {
        candidateBelow = { id: sec.id, dist: offsetFromTop, depth };
      }
    } else {
      const distance = Math.abs(offsetFromTop);
      const isCloser = distance < candidateAbove.dist;
      const isSameDistButDeeper =
        distance === candidateAbove.dist && depth > candidateAbove.depth;
      if (isCloser || isSameDistButDeeper) {
        candidateAbove = { id: sec.id, dist: distance, depth };
      }
    }
  });
  return candidateBelow.id ?? candidateAbove.id;
};

export const isEmail = (email: string) => {
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email);
};

export const isSocialUrl = (account: string, url: string): boolean => {
  if (!url || url.trim() === "") return true;

  const patterns: Record<string, RegExp> = {
    linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
    facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
    "x.com": /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i,
    youtube: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/i,
  };

  const pattern = patterns[account];
  if (!pattern) return true;
  return pattern.test(url);
};

export const buildChapterUrl = (
  params: Record<string, string | number | null | undefined>,
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `/chapter?${query}` : "/chapter";
};
