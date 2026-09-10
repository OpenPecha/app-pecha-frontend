import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import "@testing-library/jest-dom";
import Sources from "./Sources";
import { mockTolgee } from "../../../test-utils/CommonMocks";
import { QueryClientProvider, QueryClient } from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import * as reactQuery from "react-query";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../commons/pagination/PaginationComponent", () => ({
  default: ({ pagination, totalPages, handlePageChange }) => (
    <div data-testid="pagination-component" onClick={() => handlePageChange(2)}>
      Page {pagination.currentPage} of {totalPages}
    </div>
  ),
}));

vi.mock("../../../utils/highlightUtils.jsx", () => ({
  highlightSearchMatch: (text, searchText, className) => text,
}));

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: () => "bo",
  getSearchErrorMessage: (error, t) => {
    const status = error?.response?.status;
    if (status === 404) return "No results to display.";
    if (status === 429) return "Too many requests. Please wait and try again.";
    if (status === 503)
      return "Service temporarily unavailable. Please try again.";
    return "Something went wrong. Please try again.";
  },
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key, defaultValue) => defaultValue || key,
    }),
  };
});

describe("Sources Component", () => {
  const queryClient = new QueryClient();

  const renderWithProviders = (ui) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider fallback={"Loading..."} tolgee={mockTolgee}>
          <MemoryRouter>{ui}</MemoryRouter>
        </TolgeeProvider>
      </QueryClientProvider>,
    );
  };

  const mockSourceData = {
    query: "word that is being searched",
    sources: [
      {
        text: {
          text_id: "uuid-1",
          language: "bo",
          title: "text title",
          published_date: "12-02-2025",
        },
        segment_matches: [
          {
            segment_id: "segment-uuid-1",
            content: "segment content",
          },
          {
            segment_id: "segment-uuid-2",
            content: "segment content",
          },
        ],
      },
      {
        text: {
          text_id: "uuid-2",
          language: "en",
          title: "text title",
          published_date: "12-02-2025",
        },
        segment_matches: [
          {
            segment_id: "segment-uuid-3",
            content: "segment content",
          },
        ],
      },
    ],
    skip: 0,
    limit: 10,
    total: 2,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockReset();
  });

  test("renders sources when data is loaded successfully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSourceData,
      isLoading: false,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    expect(screen.getAllByText("text title")).toHaveLength(2);
    expect(screen.getAllByText("12-02-2025")).toHaveLength(2);
    expect(screen.getAllByText("segment content")).toHaveLength(3);

    expect(screen.getByTestId("pagination-component")).toBeInTheDocument();
  });

  test("displays loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: true,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    expect(screen.getByText("common.loading")).toBeInTheDocument();
  });

  test("displays error message when API call fails", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: { message: "Failed to fetch data" },
    }));

    renderWithProviders(<Sources query="test" />);

    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  test("displays message when no results are found", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: {
        query: "word that is being searched",
        sources: [],
        skip: 0,
        limit: 10,
        total: 0,
      },
      isLoading: false,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });

  test("displays 404 error message correctly", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: { response: { status: 404 } },
    }));

    renderWithProviders(<Sources query="test" />);

    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });

  test("handles pagination correctly", () => {
    const sourcesData = {
      ...mockSourceData,
      sources: Array(30).fill(mockSourceData.sources[0]), // Create 30 copies of the first source
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: sourcesData,
      isLoading: false,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    // Check if pagination appears for 30 items (default: 10 per page)
    const paginationComponent = screen.getByTestId("pagination-component");
    expect(paginationComponent).toBeInTheDocument();

    fireEvent.click(paginationComponent);
  });

  test("pages through every match, not just the sources on this page", () => {
    // What one page of an exact search actually looks like: the API ranks and
    // slices the matches, then groups them, so a page of 10 matches can arrive
    // as only two sources while `total` reports far more matches overall.
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: { ...mockSourceData, skip: 0, limit: 10, total: 74 },
      isLoading: false,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    // 74 matches at 10 per page. Dividing the two grouped sources by the limit
    // gave a single page and stranded every match after the tenth.
    expect(screen.getByTestId("pagination-component")).toHaveTextContent(
      "Page 1 of 8",
    );
  });

  test("navigates correctly when segment is clicked", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockSourceData,
      isLoading: false,
      error: null,
    }));

    renderWithProviders(<Sources query="test" />);

    const firstSegment = screen.getAllByText("segment content")[0];
    fireEvent.click(firstSegment);

    // Verify navigation was called with the correct URL format
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/chapter?text_id=uuid-1&segment_id=segment-uuid-1&versionId=",
    );
  });
});
