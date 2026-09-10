import { useMemo, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useDebounce } from "use-debounce";
import { useQuery } from "react-query";
import PaginationComponent from "../../../../commons/pagination/PaginationComponent.tsx";
import SourceItem from "./SourceItem.tsx";
import { multilingualSearch } from "@/services/library";

export const fetchSegments = async (
  query: string,
  skip: number,
  pagination: { currentPage: number; limit: number },
) => {
  return multilingualSearch({
    query,
    searchType: "exact",
    limit: pagination.limit,
    skip,
  });
};

const SheetSegmentModal = ({
  onClose,
  onSegment,
}: {
  onClose: () => void;
  onSegment: (segment: { segment_id: string; content: string }) => void;
}) => {
  const [searchFilter, setSearchFilter] = useState("");
  const [debouncedSearchFilter] = useDebounce(searchFilter, 500);
  const [pagination, setPagination] = useState({ currentPage: 1, limit: 10 });
  const skip = useMemo(
    () => (pagination.currentPage - 1) * pagination.limit,
    [pagination],
  );
  const { data: searchData, isLoading } = useQuery(
    ["sheetSegmentSearch", debouncedSearchFilter, skip, pagination],
    () => fetchSegments(debouncedSearchFilter, skip, pagination),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      enabled: !!(debouncedSearchFilter.trim() !== ""),
    },
  );

  const totalSegments = searchData?.total || 0;
  const totalPages = Math.ceil(totalSegments / pagination.limit);

  const handlePageChange = (pageNumber: number) => {
    setPagination((prev) => ({ ...prev, currentPage: pageNumber }));
  };

  const renderModalHeader = () => {
    return (
      <div className="flex items-start justify-between">
        <p className="search-segment-title overalltext m-0 text-2xl font-semibold text-[#A9080E]">
          Search Segment
        </p>
        <button
          type="button"
          className="close-button absolute right-5 top-5 flex items-center justify-center rounded-md p-1 text-2xl text-gray-700 transition hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#A9080E]/70"
          onClick={onClose}
          aria-label="Close search segment modal"
        >
          <IoClose />
        </button>
      </div>
    );
  };

  const renderSegmentContent = () => {
    const sources = searchData?.sources || [];

    const renderSegmentList = () => {
      if (sources.length === 0) {
        return (
          <div className="empty flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-200 p-10 text-center">
            <div>
              <p className="m-0 mb-2 text-lg font-medium text-[#2c3e50]">
                No data found
              </p>
              <span className="text-sm text-gray-600">
                Try adjusting your search terms
              </span>
            </div>
          </div>
        );
      }
      return sources.map((source: any) => (
        <SourceItem
          key={source.text.text_id}
          source={source}
          onSegment={onSegment}
        />
      ));
    };
    return (
      <div className=" flex min-h-0 flex-1 flex-col overflow-hidden pr-2">
        <input
          type="text"
          placeholder="Search Segments..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className=" mb-2.5 w-full rounded-lg border border-gray-200 px-3 py-2.5 ring-0 outline-none"
        />
        <div className=" flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
          {isLoading ? (
            <div className=" flex flex-1 items-center justify-center rounded-lg border border-dashed ring-0 border-gray-200 p-10 text-center">
              <p className="m-0 text-base text-gray-600">Loading segments...</p>
            </div>
          ) : (
            renderSegmentList()
          )}
        </div>
        <div className="mt-auto flex justify-center bg-white pt-5">
          <PaginationComponent
            pagination={pagination}
            totalPages={isLoading ? 1 : totalPages}
            handlePageChange={handlePageChange}
            setPagination={setPagination}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/50 px-4">
      <div className="relative flex h-[500px] w-full max-w-3xl flex-col gap-5 rounded-lg bg-white p-5 md:w-1/2">
        {renderModalHeader()}
        {renderSegmentContent()}
      </div>
    </div>
  );
};
export default SheetSegmentModal;
