import React from "react";
import {
  buildChapterUrl,
  getEarlyReturn,
  getLanguageClass,
} from "../../../utils/helperFunctions.tsx";
import { Link } from "react-router-dom";
import { useTranslate } from "@tolgee/react";
import { Badge } from "@/components/ui/badge.tsx";
import { usePanelContext } from "@/context/PanelContext.tsx";
import { useLanguageLabel } from "@/context/LanguagesContext.tsx";

type VersionItem = {
  id: string;
  title: string;
  language: string;
  table_of_contents?: string[];
  source_link?: string | null;
  license?: string | null;
};

type VersionsData = {
  versions: VersionItem[];
  text?: VersionItem;
};

type VersionsProps = {
  contentId?: string;
  versions?: VersionsData;
  versionsIsLoading: boolean;
  versionsIsError: unknown;
  addChapter?: (chapterData: any, currentChapter: any) => void;
  currentChapter?: any;
};

const CommonCard = ({
  version,
  contentId,
  addChapter,
  currentChapter,
}: {
  version: VersionItem;
  contentId?: string;
  addChapter?: (chapterData: any, currentChapter: any) => void;
  currentChapter?: any;
}) => {
  const { closeResourcesPanel } = usePanelContext() as any;
  const languageLabel = useLanguageLabel();

  const handleOpenText = () => {
    addChapter?.({ textId: version.id }, currentChapter);
    closeResourcesPanel?.();
  };

  const renderTitle = () => {
    if (addChapter) {
      return (
        <button
          type="button"
          onClick={handleOpenText}
          className="text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div
            className={` text-lg font-bold text-zinc-600 ${getLanguageClass(version.language)}`}
          >
            {version.title}
          </div>
        </button>
      );
    }
    return (
      <Link
        to={buildChapterUrl({ text_id: version.id, content_id: contentId })}
        className="text-left"
      >
        <div
          className={` text-lg font-bold text-zinc-600 ${getLanguageClass(version.language)}`}
        >
          {version.title}
        </div>
      </Link>
    );
  };

  return (
    <div className="w-full flex items-center bg-white py-1 border-t">
      <div className="flex flex-1 flex-col gap-2">
        {renderTitle()}
        <div className="space-y-1 text-sm text-zinc-500">
          {version.source_link && (
            <div className="flex gap-2">
              <span className="font-medium">Source: {version.source_link}</span>
            </div>
          )}
          {version.license && (
            <div className="flex gap-2">
              <span className="font-medium">License: {version.license}</span>
            </div>
          )}
        </div>
      </div>
      <Badge variant="outline" className={`w-fit py-2 px-4 overalltext`}>
        {languageLabel(version.language)}
      </Badge>
    </div>
  );
};

const Versions = ({
  contentId: propContentId,
  versions,
  versionsIsLoading,
  versionsIsError,
  addChapter,
  currentChapter,
}: VersionsProps) => {
  const { t } = useTranslate();

  const earlyReturn = getEarlyReturn({
    isLoading: versionsIsLoading,
    error: versionsIsError,
    t,
  });
  if (earlyReturn) return earlyReturn;
  if (!versions?.versions?.length && !versions?.text) {
    return (
      <div className="rounded border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-600">
        <p className="mt-2">{t("global.not_found")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {versions.text && (
        <CommonCard
          version={versions.text}
          contentId={propContentId}
          addChapter={addChapter}
          currentChapter={currentChapter}
        />
      )}

      {versions?.versions.map((version) => {
        const firstContentId = version.table_of_contents?.[0];
        return (
          <CommonCard
            key={version.id}
            version={version}
            contentId={firstContentId}
            addChapter={addChapter}
            currentChapter={currentChapter}
          />
        );
      })}
    </div>
  );
};

export default React.memo(Versions);
