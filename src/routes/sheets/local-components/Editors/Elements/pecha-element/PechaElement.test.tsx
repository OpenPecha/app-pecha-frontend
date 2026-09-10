import { vi, describe, beforeEach, test, expect, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  QueryClient,
  QueryClientProvider,
  type UseQueryResult,
} from "react-query";
import PechaElement, { fetchSegmentDetails } from "./PechaElement.js";
import {
  mockAxios,
  mockReactQuery,
} from "../../../../../../test-utils/CommonMocks.js";
import * as reactQuery from "react-query";
import { removeFootnotes } from "../../../../sheet-utils/Constant.js";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.js";

import { getSegmentById } from "@/services/library";
mockAxios();
mockReactQuery();

vi.mock("@/services/library", () => ({
  getSegmentById: vi.fn(),
}));

vi.mock("../../../../../../utils/helperFunctions.jsx", () => ({
  getLanguageClass: vi.fn(() => "tibetan-class"),
}));

vi.mock("../../../../sheet-utils/Constant", () => ({
  removeFootnotes: vi.fn((content) => content),
}));

vi.mock("../../../../../../assets/icons/pecha_icon.png", () => ({
  default: "mocked-pecha-icon.png",
}));

describe("PechaElement Component", () => {
  const queryClient = new QueryClient();
  const mockSegmentData = {
    content: "<p>Sample content with [footnote]</p>",
    text: {
      title: "Sample Text Title",
      language: "tibetan",
    },
  };

  const mockUseQuery = vi.spyOn(reactQuery, "useQuery") as unknown as Mock;
  const mockGetLanguageClass = getLanguageClass as unknown as Mock;
  const mockRemoveFootnotes = removeFootnotes as unknown as Mock;
  const getSegmentByIdMock = getSegmentById as unknown as Mock;

  const buildQueryResult = (override: any = {}) =>
    ({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      refetch: vi.fn(),
      status: "success",
      ...override,
    }) as unknown as UseQueryResult;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue(buildQueryResult({ data: mockSegmentData }));
    mockGetLanguageClass.mockReturnValue("tibetan-class");
    mockRemoveFootnotes.mockImplementation((content: string) => content);
  });

  const defaultProps: any = {
    attributes: { "data-testid": "pecha-element" },
    children: null,
    element: {
      src: "segment-123",
    },
  };

  const setup = (props: any = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <PechaElement {...defaultProps} {...props} />
      </QueryClientProvider>,
    );
  };

  test("shows loading state when data is being fetched", () => {
    mockUseQuery.mockReturnValue(
      buildQueryResult({ data: null, isLoading: true }),
    );

    setup();

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("renders segment data when loaded successfully", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByText("Sample Text Title")).toBeInTheDocument();
    });

    const container = screen.getByTestId("pecha-element");
    expect(container).toBeInTheDocument();
    expect(container.textContent).toContain("Sample Text Title");
    expect(mockRemoveFootnotes).toHaveBeenCalledWith(
      "<p>Sample content with [footnote]</p>",
    );
    const languageWrapper = container.querySelector(".tibetan-class");
    expect(languageWrapper).toBeInTheDocument();
  });

  test("disables query when segmentId is falsy", () => {
    setup({ element: { src: null } });
    expect(mockUseQuery).toHaveBeenCalledWith(
      ["segment", ""],
      expect.any(Function),
      {
        enabled: false,
        refetchOnWindowFocus: false,
      },
    );
  });

  test("fetchSegmentDetails function makes correct API call", async () => {
    getSegmentByIdMock.mockResolvedValueOnce(mockSegmentData);

    const segmentId = "segment-123";
    const result = await fetchSegmentDetails(segmentId);

    expect(getSegmentByIdMock).toHaveBeenCalledWith("segment-123");

    expect(result).toEqual(mockSegmentData);
  });

  test("useQuery executes fetchSegmentDetails function", async () => {
    getSegmentByIdMock.mockResolvedValueOnce(mockSegmentData);

    mockUseQuery.mockImplementation(
      (_queryKey: any, queryFn: any, options: any) => {
        if (options?.enabled) {
          queryFn();
        }
        return buildQueryResult({ data: mockSegmentData });
      },
    );

    setup();

    expect(getSegmentByIdMock).toHaveBeenCalledWith("segment-123");
  });
});
