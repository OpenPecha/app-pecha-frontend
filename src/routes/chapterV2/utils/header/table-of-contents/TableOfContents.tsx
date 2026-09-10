import React, { useState, useEffect, useRef } from "react";
import { useTranslate } from "@tolgee/react";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { getLanguageClass } from "../../../../../utils/helperFunctions.tsx";
import { useQuery } from "react-query";
import { getTableOfContents } from "@/services/library";

type TocSegment = { segment_id: string };
type TocSection = {
  id: string;
  title: string;
  sections: TocSection[];
  segments?: TocSegment[];
};
type TocContent = { id: string; sections: TocSection[] };
type TocResponse = {
  contents?: TocContent[];
  text_detail?: { language?: string } | null;
};

const TableOfContents = (props: any) => {
  const {
    textId,
    showTableOfContents,
    currentSectionId,
    onSegmentSelect,
    language,
    onClose,
  } = props;
  const { t } = useTranslate();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const tocContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    data: tableOfContents,
    error,
    isLoading,
  } = useQuery<TocResponse>(
    ["toc", textId, language],
    () => getTableOfContents(textId),
    {
      enabled: !!textId,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 20,
    },
  );
  useEffect(() => {
    const container = tocContainerRef.current;
    if (!container) return;
    const activeElement = container.querySelector<HTMLElement>(
      ".section-header.current-section",
    );
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentSectionId, expandedSections]);

  const contentData: TocContent[] = tableOfContents?.contents || [];

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSectionTitleClick = (segmentId?: string) => {
    if (typeof segmentId !== "string") return;
    onSegmentSelect(segmentId as string);
  };

  const renderToggleIcon = (isExpanded: boolean, hasChildren: boolean) => {
    if (!hasChildren) return <span className="h-4 w-4" aria-hidden />;
    return isExpanded ? (
      <FiChevronDown size={16} className="h-4 w-4 text-gray-600" />
    ) : (
      <FiChevronRight size={16} className="h-4 w-4 text-gray-600" />
    );
  };

  const renderSectionTitle = (section: TocSection, segmentId?: string) => (
    <button
      type="button"
      onClick={() => handleSectionTitleClick(segmentId)}
      className={`${getLanguageClass(tableOfContents?.text_detail?.language || "en")} px-3 py-2 w-full text-left text-lg text-gray-600 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white`}
    >
      {section.title}
    </button>
  );

  const renderNestedSections = (section: TocSection, contentId: string) => (
    <div className="ml-5">
      {(section.sections ?? []).map((childSection) =>
        renderSectionTree(childSection, contentId),
      )}
    </div>
  );

  const renderSectionTree = (section: TocSection, contentId: string) => {
    const isExpanded = Boolean(expandedSections[section.id]);
    const hasChildren =
      Array.isArray(section.sections) && section.sections.length > 0;
    const segmentId = hasChildren
      ? section.sections[0]?.segments?.[0]?.segment_id
      : section.segments?.[0]?.segment_id;
    const isCurrentSection = currentSectionId === section.id;

    return (
      <div key={section.id} className="mt-1">
        <button
          type="button"
          className={`flex w-full items-center bg-transparent border-0 px-0 py-0 text-left cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${isCurrentSection ? "pl-2 border-l-[6px] border-[#18345D] bg-gray-50" : ""}`}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            const target = event.target as HTMLElement;
            if (target.tagName !== "A") toggleSection(section.id);
          }}
        >
          <span className="mr-2 flex min-w-4 items-center text-gray-600">
            {renderToggleIcon(isExpanded, hasChildren)}
          </span>
          {renderSectionTitle(section, segmentId)}
        </button>
        {isExpanded && hasChildren && renderNestedSections(section, contentId)}
      </div>
    );
  };

  const renderTocContent = () => {
    if (isLoading) {
      return (
        <div className="overalltext px-4 py-2 text-sm text-gray-700">
          {t("common.loading")}
        </div>
      );
    }

    if (error) {
      return (
        <div className="overalltext px-4 py-2 text-sm text-gray-700">
          {t("global.not_found")}
        </div>
      );
    }

    if (!contentData || contentData.length === 0) {
      return (
        <div className="overalltext px-4 py-2 text-sm text-gray-700">
          No content found
        </div>
      );
    }

    return contentData.flatMap(
      (content) =>
        content?.sections?.map((section) =>
          renderSectionTree(section, content.id),
        ) || [],
    );
  };

  return (
    <>
      {showTableOfContents && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          aria-label={t("text.table_of_contents")}
        />
      )}
      <div
        className={[
          "fixed lg:sticky lg:top-0 z-50 lg:z-10 bg-white border-r border-[#e0e0e0] shadow-md overflow-y-auto overflow-x-hidden transition-[width,left,transform] duration-300 ease-in-out flex flex-col",
          "left-0 h-screen lg:h-full",
          showTableOfContents
            ? "translate-x-0 w-[280px] sm:w-[320px] md:w-[300px]"
            : "-translate-x-full w-0",
          "lg:translate-x-0",
          showTableOfContents ? "lg:w-[clamp(200px,20vw,240px)]" : "lg:w-0",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 pt-4 pb-3">
          <p className="overalltext m-0 text-lg font-semibold text-gray-800">
            {t("text.table_of_contents")}
          </p>
        </div>
        <div
          className=" mt-2 flex-1 overflow-y-auto text-left"
          ref={tocContainerRef}
        >
          <div className="space-y-1 pb-4">{renderTocContent()}</div>
        </div>
      </div>
    </>
  );
};

export default React.memo(TableOfContents);
