import { useCallback, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import {
  fetchPublicSeries,
  fetchUserSeriesEnrollments,
} from "../api/plansApi.ts";
import SeriesCard from "./SeriesCard.tsx";
import JoinableGroupsSection from "../../mantras/components/JoinableGroupsSection.tsx";
import { getEarlyReturn } from "../../../utils/helperFunctions.tsx";
import { siteDescription, siteName } from "../../../utils/constants.ts";
import Seo from "../../commons/seo/Seo.tsx";
import DownloadAppModal from "../../../components/DownloadAppModal.tsx";
import {
  isMobileDevice,
  openAppDownloadPage,
} from "../../../utils/deviceUtils.ts";
import type { PlanLanguageCode } from "../utils/seriesUtils.ts";

type SeriesListViewProps = {
  apiLanguage: string;
  language: PlanLanguageCode;
  isAuthenticated: boolean;
  onSelectSeries: (seriesId: string) => void;
  onViewSeriesPlans: (seriesId: string) => void;
  onViewAllGroups: () => void;
};

const SeriesListView = ({
  apiLanguage,
  language,
  isAuthenticated,
  onSelectSeries,
  onViewSeriesPlans,
  onViewAllGroups,
}: SeriesListViewProps) => {
  const { t } = useTranslate();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const handleOpenApp = useCallback(() => {
    if (isMobileDevice()) {
      openAppDownloadPage();
      return;
    }
    setDownloadModalOpen(true);
  }, []);

  const {
    data: seriesData,
    isLoading: isSeriesLoading,
    error: seriesError,
  } = useQuery(
    ["public-series", apiLanguage],
    () => fetchPublicSeries(apiLanguage),
    { refetchOnWindowFocus: false },
  );

  const { data: enrollmentsData } = useQuery(
    ["user-series-enrollments", apiLanguage],
    () => fetchUserSeriesEnrollments(apiLanguage),
    {
      enabled: isAuthenticated,
      refetchOnWindowFocus: false,
    },
  );

  const enrollmentBySeriesId = useMemo(() => {
    const map = new Map<
      string,
      NonNullable<typeof enrollmentsData>["enrollments"][number]
    >();
    enrollmentsData?.enrollments.forEach((entry) => {
      map.set(entry.series_id, entry);
    });
    return map;
  }, [enrollmentsData]);

  const earlyReturn = getEarlyReturn({
    isLoading: isSeriesLoading,
    error: seriesError,
    t,
  });
  if (earlyReturn) return earlyReturn;

  const seriesList = seriesData?.series ?? [];
  // The featured practice leads the grid; everything else keeps its order.
  const featuredSeries = seriesList.find((series) => series.featured);
  const orderedSeries = featuredSeries
    ? [featuredSeries, ...seriesList.filter((s) => s.id !== featuredSeries.id)]
    : seriesList;

  return (
    <>
      <Seo
        title={`${siteName} — ${t("plans.practice_routines", "Practice Routines")}`}
        description={siteDescription}
        canonical={`${window.location.origin}/`}
      />
      <div className="min-h-[calc(100dvh-4rem)] bg-[#f4f6f8]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <p className="en-serif-text text-lg italic text-slate-500">
              {t("header.plans", "Plans")} —
            </p>
            <h1 className="mt-2 text-3xl font-semibold leading-[1.15] tracking-tight text-[#102544] sm:text-4xl">
              {t("home.practices_heading_lead", "Give the day")}{" "}
              <span className="en-serif-text italic">
                {t("home.practices_heading_accent", "a shape")}
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-slate-600">
              {t(
                "home.practices_description",
                "Guided plans you can follow at your own pace, whether you have five minutes or an hour.",
              )}
            </p>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-4 pb-16 pt-10 sm:px-6">
          {/*
            One grid rather than a featured banner above a scrolling strip: the
            first practice takes a larger tile, the rest fill in around it. That
            variation is what stops a listing reading as a row of blocks.
          */}
          <section
            id="practices"
            className="scroll-mt-24"
            aria-label={t("plans.practice_routines", "Practice Routines")}
          >
            {seriesList.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                {t(
                  "plans.no_series_available",
                  "No practice routines available yet.",
                )}
              </p>
            ) : (
              <div className="grid auto-rows-[11rem] grid-cols-2 gap-4 sm:auto-rows-[12rem] lg:grid-cols-4">
                {orderedSeries.map((series, index) => (
                  <div
                    key={series.id}
                    // The first tile takes a 2x2 block; on the narrowest layout
                    // it stays full width so its title has room to breathe.
                    className={
                      index === 0
                        ? "col-span-2 row-span-2 lg:col-span-2"
                        : "col-span-1"
                    }
                  >
                    <SeriesCard
                      series={series}
                      language={language}
                      enrollment={enrollmentBySeriesId.get(series.id)}
                      onSelect={onSelectSeries}
                      onViewPlans={onViewSeriesPlans}
                      variant="tile"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <JoinableGroupsSection
            apiLanguage={apiLanguage}
            language={language}
            onOpenApp={handleOpenApp}
            onViewAllGroups={onViewAllGroups}
          />
        </div>
      </div>
      <DownloadAppModal
        open={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
};

export default SeriesListView;
