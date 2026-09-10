import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "react-query";
import IndividualTextSearch, {
  fetchTextSearchResults,
} from "./IndividualTextSearch";
import { usePanelContext } from "../../../../../../context/PanelContext";

import { multilingualSearch } from "@/services/library";
vi.mock("@/services/library", () => ({
  multilingualSearch: vi.fn(),
}));

vi.mock("use-debounce", () => ({
  useDebounce: vi.fn((value: string) => [value, vi.fn()]),
}));

vi.mock("../../../../../../context/PanelContext", () => ({
  usePanelContext: vi.fn(() => ({
    closeResourcesPanel: vi.fn(),
    openResourcesPanel: vi.fn(),
    isResourcesPanelOpen: true,
  })),
}));

vi.mock("react-router-dom", () => ({
  useSearchParams: vi.fn(),
}));

vi.mock("@tolgee/react", () => ({
  useTranslate: vi.fn(() => ({
    t: vi.fn((key: string, fallback?: string) => fallback || key),
  })),
}));

vi.mock("react-query", () => ({
  useQuery: vi.fn(),
}));

vi.mock("../../../../../../config/axios-config", () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
  },
}));

vi.mock("../../../../../../utils/helperFunctions", () => ({
  getLanguageClass: vi.fn((lang: string) => `${lang}-text`),
  getEarlyReturn: vi.fn(() => null),
  mapLanguageCode: vi.fn((code: string) => code),
}));

vi.mock("../../../../../../utils/highlightUtils", () => ({
  highlightSearchMatch: vi.fn(
    (content: string, _query: string, _className: string) => content,
  ),
}));

vi.mock("../../../../../../utils/constants", () => ({
  LANGUAGE: "LANGUAGE",
}));

vi.mock("../../../../../commons/pagination/PaginationComponent", () => ({
  default: ({
    totalPages,
    handlePageChange,
  }: {
    totalPages: number;
    handlePageChange: (page: number) => void;
  }) => (
    <div data-testid="pagination">
      {Array.from({ length: totalPages }, (_, i) => (
        <button key={i + 1} onClick={() => handlePageChange(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
  ),
}));

vi.mock("../common/ResourceHeader", () => ({
  default: ({
    title,
    onBack,
    onClose,
  }: {
    title: string;
    onBack: () => void;
    onClose: () => void;
  }) => (
    <div data-testid="resource-header">
      <span>{title}</span>
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
      <button data-testid="close-button" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue("en");
});

describe("fetchTextSearchResults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call axios with correct parameters", async () => {
    const mockQuery = "test query";
    const mockTextId = "text123";
    const mockLanguage = "en";
    const mockSkip = 10;
    const mockPagination = { limit: 10, currentPage: 2 };
    const mockResponse = { data: { query: mockQuery, sources: [], total: 0 } };

    (multilingualSearch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse.data,
    );

    const result = await fetchTextSearchResults(
      mockQuery,
      mockTextId,
      mockSkip,
      mockPagination,
    );

    expect(multilingualSearch).toHaveBeenCalledWith({
      query: mockQuery,
      searchType: "exact",
      textId: mockTextId,
      limit: mockPagination.limit,
      skip: mockSkip,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("should handle API errors correctly", async () => {
    const mockError = new Error("API Error");
    (multilingualSearch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      mockError,
    );

    await expect(
      fetchTextSearchResults("query", "textId", 0, {
        limit: 10,
        currentPage: 1,
      }),
    ).rejects.toThrow("API Error");
  });

  it("should handle empty parameters gracefully", async () => {
    const mockResponse = { data: { query: "", sources: [], total: 0 } };
    (multilingualSearch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse.data,
    );

    const result = await fetchTextSearchResults("", "", 0, {
      limit: 10,
      currentPage: 1,
    });

    expect(multilingualSearch).toHaveBeenCalledWith({
      query: "",
      searchType: "exact",
      textId: "",
      limit: 10,
      skip: 0,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it("should process the expected API response format correctly", async () => {
    const mockQuery = "buddha";
    const mockTextId = "text123";
    const mockLanguage = "en";
    const mockSegmentMatches = [
      {
        segment_id: "seg1",
        content: "This is about the <em>buddha</em> dharma.",
      },
      {
        segment_id: "seg2",
        content: "The <em>buddha</em> taught compassion.",
      },
    ];

    const mockResponse = {
      data: {
        query: mockQuery,
        total: 2,
        sources: [
          {
            text: {
              id: mockTextId,
              title: "Buddhist Text",
              language: "en",
            },
            segment_matches: mockSegmentMatches,
          },
        ],
      },
    };

    (multilingualSearch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse.data,
    );

    const result = await fetchTextSearchResults(mockQuery, mockTextId, 0, {
      limit: 10,
      currentPage: 1,
    });

    expect(result).toEqual(mockResponse.data);
    expect(result.query).toBe(mockQuery);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].segment_matches).toEqual(mockSegmentMatches);
    expect(result.sources[0].text.id).toBe(mockTextId);
  });

  it("should handle pagination with more than 10 results", async () => {
    const mockQuery = "dharma";
    const mockTextId = "text123";
    const mockLanguage = "en";

    const mockSegmentMatches = Array.from({ length: 11 }, (_, i) => ({
      segment_id: `seg${i + 1}`,
      content: `Content ${i + 1} with <em>dharma</em> reference.`,
    }));

    const mockResponse = {
      data: {
        query: mockQuery,
        total: 11,
        sources: [
          {
            text: {
              id: mockTextId,
              title: "Buddhist Text",
              language: "en",
            },
            segment_matches: mockSegmentMatches,
          },
        ],
      },
    };

    (multilingualSearch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockResponse.data,
    );

    const pagination = { limit: 10, currentPage: 1 };
    const skip = 0;
    const result = await fetchTextSearchResults(
      mockQuery,
      mockTextId,
      skip,
      pagination,
    );

    expect(multilingualSearch).toHaveBeenCalledWith({
      query: mockQuery,
      searchType: "exact",
      textId: mockTextId,
      limit: pagination.limit,
      skip: skip,
    });
    expect(result.sources[0].segment_matches.length).toBe(11);

    const totalSegments = result.sources[0].segment_matches.length;
    const totalPages = Math.ceil(totalSegments / pagination.limit);
    expect(totalPages).toBe(2);
  });
});

describe("IndividualTextSearch Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  it("should use textId from URL search params when not provided as prop", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123FromURL");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    expect(useSearchParams).toHaveBeenCalled();

    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining([
        "textSearch",
        expect.anything(),
        "text123FromURL",
      ]),
      expect.any(Function),
      expect.any(Object),
    );
  });

  it("should prioritize textId prop over URL search params", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123FromURL");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const propTextId = "text123FromProp";

    render(
      <IndividualTextSearch
        onClose={vi.fn()}
        textId={propTextId}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    expect(useSearchParams).toHaveBeenCalled();

    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(["textSearch", expect.anything(), propTextId]),
      expect.any(Function),
      expect.any(Object),
    );
  });

  it("should handle case when no textId is provided in props or URL", () => {
    const mockSearchParams = new URLSearchParams();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    expect(useSearchParams).toHaveBeenCalled();

    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(["textSearch", expect.anything(), null]),
      expect.any(Function),
      expect.any(Object),
    );
  });

  it("should trigger search when form is submitted with valid query", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const mockOnClose = vi.fn();
    const mockHandleSegmentNavigate = vi.fn();
    const mockHandleNavigate = vi.fn();

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={mockOnClose}
        handleSegmentNavigate={mockHandleSegmentNavigate}
        handleNavigate={mockHandleNavigate}
      />,
    );

    const searchInput = getByPlaceholderText(
      "connection_panel.search_in_this_text",
    ) as HTMLInputElement;

    fireEvent.change(searchInput, { target: { value: "buddha" } });

    const form = searchInput.closest("form");
    if (form) fireEvent.submit(form);

    expect(useQuery).toHaveBeenCalledWith(
      expect.arrayContaining(["textSearch", "buddha", "text123"]),
      expect.any(Function),
      expect.objectContaining({
        refetchOnWindowFocus: false,
        retry: 1,
      }),
    );
  });

  it("should not trigger search when form is submitted with empty query", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const mockOnClose = vi.fn();

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={mockOnClose}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    const searchInput = getByPlaceholderText(
      "connection_panel.search_in_this_text",
    ) as HTMLInputElement;

    const form = searchInput.closest("form");
    if (form) fireEvent.submit(form);

    expect(useQuery).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.objectContaining({
        enabled: false,
      }),
    );
  });

  it("should update search input field correctly when typing", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    const searchInput = getByPlaceholderText(
      "connection_panel.search_in_this_text",
    ) as HTMLInputElement;

    expect(searchInput.value).toBe("");

    fireEvent.change(searchInput, { target: { value: "b" } });
    expect(searchInput.value).toBe("b");

    fireEvent.change(searchInput, { target: { value: "bu" } });
    expect(searchInput.value).toBe("bu");

    fireEvent.change(searchInput, { target: { value: "buddha" } });
    expect(searchInput.value).toBe("buddha");

    fireEvent.change(searchInput, { target: { value: "" } });
    expect(searchInput.value).toBe("");
  });

  it("should render search input with correct attributes", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    const searchInput = getByPlaceholderText(
      "connection_panel.search_in_this_text",
    ) as HTMLInputElement;

    expect(searchInput).toBeInTheDocument();
    expect(searchInput.tagName.toLowerCase()).toBe("input");
    expect(searchInput.type).toBe("text");
    expect(searchInput).toHaveAttribute(
      "placeholder",
      "connection_panel.search_in_this_text",
    );
  });

  it("renders results and clicking a segment opens resources and navigates to segment", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const openResourcesPanel = vi.fn();
    (usePanelContext as ReturnType<typeof vi.fn>).mockReturnValue({
      openResourcesPanel,
      closeResourcesPanel: vi.fn(),
      isResourcesPanelOpen: true,
    });

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        query: "buddha",
        total: 2,
        sources: [
          {
            text: { language: "en" },
            segment_matches: [
              { segment_id: "seg1", content: "One the" },
              { segment_id: "seg2", content: "Two the" },
            ],
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const handleSegmentNavigate = vi.fn();
    const { getByPlaceholderText, getAllByRole } = render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={handleSegmentNavigate}
        handleNavigate={vi.fn()}
      />,
    );

    fireEvent.change(
      getByPlaceholderText("connection_panel.search_in_this_text"),
      {
        target: { value: "the" },
      },
    );

    const segmentButtons = getAllByRole("button").filter(
      (btn) => !btn.closest("[data-testid]"),
    );
    expect(segmentButtons.length).toBeGreaterThan(0);
    fireEvent.click(segmentButtons[0]);

    expect(handleSegmentNavigate).toHaveBeenCalledWith("seg1");
    expect(openResourcesPanel).toHaveBeenCalled();
  });

  it("renders ResourceHeader with correct props", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const mockOnClose = vi.fn();
    const mockHandleNavigate = vi.fn();

    render(
      <IndividualTextSearch
        onClose={mockOnClose}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={mockHandleNavigate}
      />,
    );

    expect(screen.getByTestId("resource-header")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const mockOnClose = vi.fn();

    render(
      <IndividualTextSearch
        onClose={mockOnClose}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId("close-button"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls handleNavigate when back button is clicked", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    const mockHandleNavigate = vi.fn();

    render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={mockHandleNavigate}
      />,
    );

    fireEvent.click(screen.getByTestId("back-button"));
    expect(mockHandleNavigate).toHaveBeenCalled();
  });

  it("displays no results message when search returns empty", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { sources: [], total: 0 },
      isLoading: false,
      error: null,
    });

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    fireEvent.change(
      getByPlaceholderText("connection_panel.search_in_this_text"),
      {
        target: { value: "nonexistent" },
      },
    );

    expect(screen.getByText("No results to display.")).toBeInTheDocument();
  });

  it("displays total results count when results are found", () => {
    const mockSearchParams = new URLSearchParams();
    mockSearchParams.set("text_id", "text123");
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue([
      mockSearchParams,
      vi.fn(),
    ]);

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        query: "test",
        total: 5,
        sources: [
          {
            text: { language: "en" },
            segment_matches: [{ segment_id: "seg1", content: "Test content" }],
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const { getByPlaceholderText } = render(
      <IndividualTextSearch
        onClose={vi.fn()}
        handleSegmentNavigate={vi.fn()}
        handleNavigate={vi.fn()}
      />,
    );

    fireEvent.change(
      getByPlaceholderText("connection_panel.search_in_this_text"),
      {
        target: { value: "test" },
      },
    );

    expect(screen.getByText(/sheet\.search\.total/)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
  });
});
