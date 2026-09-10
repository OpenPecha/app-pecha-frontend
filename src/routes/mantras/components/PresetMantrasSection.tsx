import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { fetchPresetAccumulators } from "../api/accumulatorApi.ts";
import PresetMantraCard from "./PresetMantraCard.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeading from "@/components/SectionHeading";
import type { PlanLanguageCode } from "../../planviewer/utils/seriesUtils.ts";

type PresetMantrasSectionProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  onOpenApp: () => void;
};

const PresetMantrasSection = ({
  apiLanguage,
  language,
  onOpenApp,
}: PresetMantrasSectionProps) => {
  const { t } = useTranslate();

  const { data, isLoading } = useQuery(
    ["preset-accumulators", apiLanguage],
    () => fetchPresetAccumulators(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const presets = data?.accumulators ?? [];

  if (isLoading) {
    return (
      <section className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="-mx-4 flex gap-4 overflow-hidden px-4 sm:-mx-6 sm:px-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-56 w-40 shrink-0 rounded-2xl sm:w-44"
            />
          ))}
        </div>
      </section>
    );
  }

  if (!presets.length) return null;

  return (
    <section
      className="space-y-5"
      aria-label={t("mantras.preset_mantras", "Mantras")}
    >
      <SectionHeading
        eyebrow={t("mantras.preset_mantras", "Mantras")}
        title={
          <>
            {t("home.mantras_heading_lead", "Count them")}{" "}
            <span className="en-serif-text italic">
              {t("home.mantras_heading_accent", "one by one")}
            </span>
          </>
        }
        description={t(
          "mantras.preset_mantras_description",
          "Tap a mantra to download the app and start counting.",
        )}
      />
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {presets.map((preset) => (
          <PresetMantraCard
            key={preset.id}
            preset={preset}
            language={language}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </section>
  );
};

export default PresetMantrasSection;
