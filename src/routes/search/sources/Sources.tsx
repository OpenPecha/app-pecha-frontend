import { useMemo, useState } from "react";
import { useTranslate } from "@tolgee/react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import PaginationComponent from "../../commons/pagination/PaginationComponent.tsx";
import { highlightSearchMatch } from "../../../utils/highlightUtils.tsx";
import {
  getLanguageClass,
  getSearchErrorMessage,
} from "../../../utils/helperFunctions.tsx";
import { multilingualSearch } from "@/services/library";

type SegmentMatch = {
  segment_id: string;
  content: string;
};

type SourceText = {
  text_id: string;
  title: string;
  published_date: string;
  language: string;
};

type SourceItem = {
  text: SourceText;
  segment_matches: SegmentMatch[];
};

type SourceResponse = {
  query: string;
  total: number;
  sources: SourceItem[];
};

export const fetchSources = async (
  query: string,
  skip: number,
  pagination: { limit: number },
): Promise<SourceResponse> => {
  return multilingualSearch({
    query,
    searchType: "exact",
    limit: pagination.limit,
    skip,
  });
};

const Sources = (query: any) => {
  const { t } = useTranslate();
  const stringq = query?.query;
  const navigate = useNavigate();

  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );
  const {
    data: sourceData,
    isLoading,
    error,
  } = useQuery<SourceResponse, any>(
    ["sources", stringq, skip, pagination],
    () => fetchSources(stringq, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  );
  const searchText = sourceData?.query || stringq;

  if (isLoading)
    return <div className="overalltext">{t("common.loading")}</div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-base text-gray-600">
          {getSearchErrorMessage(error, t)}
        </p>
      </div>
    );
  }
  if (!sourceData?.sources || sourceData.sources.length === 0) {
    return (
      <div className="overalltext">
        {t("search.zero_result", "No results to display.")}
      </div>
    );
  }
  // Paging is by segment match, not by source: the API slices the ranked list of
  // matches and only then groups them under their texts. Dividing the grouped
  // sources on this page by the limit gave 1 whenever a page held fewer than
  // `limit` groups - which is almost always - so later matches were unreachable
  // even though the total above reported them. `total` counts every match.
  const totalPages = Math.ceil((sourceData.total ?? 0) / pagination.limit);
  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        <p>
          {t("sheet.search.total")} : {sourceData.total}
        </p>
      </div>

      {sourceData.sources.map((source: SourceItem) => (
        <div
          key={source.text.text_id}
          className={`mb-4 space-y-2 ${getLanguageClass(source.text.language)}`}
        >
          <h4 className="text-lg font-semibold text-gray-900">
            {source.text.title}
          </h4>
          <span className="block text-sm text-gray-500">
            {source.text.published_date}
          </span>

          <div className="flex flex-col space-y-3.5">
            {source.segment_matches.map((segment: SegmentMatch) => (
              <button
                type="button"
                key={segment.segment_id}
                className="relative border-0 bg-transparent pl-4 text-justify cursor-pointer before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-full before:bg-[hsl(9,82%,36%)] before:content-[''] hover:bg-gray-50 [&_.highlighted-text]:bg-yellow-300 [&_.highlighted-text]:px-0.5"
                onClick={() => {
                  if (segment.segment_id && source.text?.text_id) {
                    navigate(
                      `/chapter?text_id=${source.text.text_id}&segment_id=${segment.segment_id}&versionId=`,
                    );
                  }
                }}
              >
                <p
                  className="m-0 text-base leading-relaxed text-gray-600"
                  dangerouslySetInnerHTML={{
                    __html: highlightSearchMatch(
                      segment.content,
                      searchText,
                      "highlighted-text",
                    ),
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      ))}

      <PaginationComponent
        pagination={pagination}
        totalPages={totalPages}
        handlePageChange={handlePageChange}
        setPagination={setPagination}
      />
    </div>
  );
};

export default Sources;
