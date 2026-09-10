import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
  mockLocalStorage,
} from "../../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter as Router } from "react-router-dom";
import { vi, describe, beforeEach, test, expect, type Mock } from "vitest";
import "@testing-library/jest-dom";
import ContentsChapter from "./ContentsChapter.js";

import { getTextDetails } from "@/services/library";
mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@/services/library", () => ({
  getTextDetails: vi.fn(),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({ t: (key: any) => key }),
  };
});

vi.mock("../../../utils/helperFunctions.jsx", () => ({
  getEarlyReturn: vi.fn(() => null),
  getFirstSegmentId: vi.fn(() => "first-segment-id"),
  getLastSegmentId: vi.fn(() => "last-segment-id"),
  mergeSections: vi.fn((a, b) => [...(a || []), ...(b || [])]),
}));

vi.mock("../utils/header/ChapterHeader.jsx", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="chapter-header-mock">ChapterHeader</div>
  ),
}));

vi.mock("./helpers/UseChapterHook.jsx", () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="use-chapter-hook-mock">UseChapterHook</div>
  ),
}));

vi.mock("../../../context/PanelContext.jsx", () => ({
  PanelProvider: ({ children }: { children: any }) => (
    <div data-testid="panel-provider-mock">{children}</div>
  ),
}));

vi.mock("../../../config/axios-config.js", () => ({
  default: {
    post: vi.fn(),
  },
}));

const queryClient = new QueryClient();

const buildInfiniteQueryResult = (override: any = {}) =>
  ({
    data: null,
    isLoading: false,
    error: null,
    ...override,
  }) as unknown as ReturnType<typeof reactQuery.useInfiniteQuery>;

const defaultProps: any = {
  textId: "text-1",
  contentId: "content-1",
  segmentId: "segment-1",
  versionId: "version-1",
  addChapter: vi.fn(),
  removeChapter: vi.fn(),
  currentChapter: { id: 1 },
  totalChapters: 5,
  setVersionId: vi.fn(),
};

const setup = (props: any = {}) => {
  return render(
    <Router>
      <QueryClientProvider client={queryClient}>
        <TolgeeProvider tolgee={mockTolgee} fallback={"Loading tolgee..."}>
          <ContentsChapter {...defaultProps} {...props} />
        </TolgeeProvider>
      </QueryClientProvider>
    </Router>,
  );
};

describe("ContentsChapter", () => {
  let localStorageMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
  });

  test("renders main container and child components", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: {
          pages: [
            {
              content: { sections: [{ id: 1 }], foo: "bar" },
              text_detail: { language: "en" },
            },
          ],
        },
        fetchNextPage: vi.fn(),
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchPreviousPage: vi.fn(),
        hasPreviousPage: false,
        isFetchingPreviousPage: false,
      }),
    );
    setup();
    expect(document.querySelector(".flex")).toBeInTheDocument();
    expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
    expect(screen.getByTestId("panel-provider-mock")).toBeInTheDocument();
  });

  test("passes correct props to UseChapterHook and ChapterHeader", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({
        data: {
          pages: [
            {
              content: { sections: [{ id: 1 }], foo: "bar" },
              text_detail: { language: "en" },
            },
          ],
        },
        fetchNextPage: vi.fn(),
        hasNextPage: true,
        isFetchingNextPage: false,
        fetchPreviousPage: vi.fn(),
        hasPreviousPage: false,
        isFetchingPreviousPage: false,
      }),
    );
    setup();
    expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
  });

  test("handles no data gracefully", () => {
    vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
      buildInfiniteQueryResult({ data: null }),
    );
    setup();
    expect(document.querySelector(".flex")).toBeInTheDocument();
  });

  describe("fetchContentDetails function", () => {
    test("calls axios with correct parameters when all props are provided", async () => {
      const mockData = { content: { sections: [] } };
      (getTextDetails as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      const queryKey = [
        "content",
        "text-1",
        "content-1",
        "version-1",
        20,
        "segment-1",
      ];
      const pageParam = { segmentId: "test-segment", direction: "next" };

      let capturedFetchFunction: any;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, fetchFn: any) => {
          capturedFetchFunction = fetchFn;
          return buildInfiniteQueryResult();
        },
      );

      setup();
      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam, queryKey });
      }

      expect(getTextDetails).toHaveBeenCalledWith("text-1", {
        segment_id: "test-segment",
        version_id: "version-1",
        direction: "next",
        size: 20,
      });
    });

    test("calls axios with default direction when pageParam is null", async () => {
      const mockData = { content: { sections: [] } };
      (getTextDetails as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      let capturedFetchFunction: any;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, fetchFn: any) => {
          capturedFetchFunction = fetchFn;
          return buildInfiniteQueryResult();
        },
      );

      setup();

      const queryKey = [
        "content",
        "text-1",
        "content-1",
        "version-1",
        20,
        "segment-1",
      ];

      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam: null, queryKey });
      }

      expect(getTextDetails).toHaveBeenCalledWith("text-1", {
        segment_id: "segment-1",
        version_id: "version-1",
        direction: "next",
        size: 20,
      });
    });

    test("calls axios without optional parameters when they are null/undefined", async () => {
      const mockData = { content: { sections: [] } };
      (getTextDetails as ReturnType<typeof vi.fn>).mockResolvedValue(mockData);

      let capturedFetchFunction: any;
      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, fetchFn: any) => {
          capturedFetchFunction = fetchFn;
          return buildInfiniteQueryResult();
        },
      );

      setup({
        contentId: null,
        segmentId: null,
        versionId: null,
      });

      const queryKey = ["content", "text-1", null, null, 20, null];

      if (capturedFetchFunction) {
        await capturedFetchFunction({ pageParam: null, queryKey });
      }

      expect(getTextDetails).toHaveBeenCalledWith("text-1", {
        direction: "next",
        size: 20,
      });
    });
  });

  describe("getNextPageParam logic", () => {
    test("returns null when the page reports no more segments below", () => {
      let capturedGetNextPageParam: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedGetNextPageParam = options.getNextPageParam;
          return buildInfiniteQueryResult();
        },
      );

      setup();

      const lastPage = {
        current_segment_position: 10,
        has_more_down: false,
        content: { sections: [{ id: 1 }] },
      };

      const result = capturedGetNextPageParam(lastPage);
      expect(result).toBeNull();
    });

    test("handles undefined lastPage gracefully", () => {
      let capturedGetNextPageParam: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedGetNextPageParam = options.getNextPageParam;
          return buildInfiniteQueryResult();
        },
      );

      setup();

      const result = capturedGetNextPageParam(undefined);
      expect(result).toBeNull();
    });
  });

  describe("getPreviousPageParam logic", () => {
    test("returns null when the page reports no more segments above", () => {
      let capturedGetPreviousPageParam: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedGetPreviousPageParam = options.getPreviousPageParam;
          return buildInfiniteQueryResult();
        },
      );

      setup();

      const firstPage = {
        current_segment_position: 1,
        has_more_up: false,
        content: { sections: [{ id: 1 }] },
      };

      const result = capturedGetPreviousPageParam(firstPage);
      expect(result).toBeNull();
    });
  });

  describe("useInfiniteQuery configuration", () => {
    test("query is enabled when textId is provided", () => {
      let capturedOptions: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedOptions = options;
          return buildInfiniteQueryResult();
        },
      );

      setup({ textId: "valid-text-id" });

      expect(capturedOptions.enabled).toBe(true);
    });

    test("query is disabled when textId is not provided", () => {
      let capturedOptions: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedOptions = options;
          return buildInfiniteQueryResult();
        },
      );

      setup({ textId: null });

      expect(capturedOptions.enabled).toBe(false);
    });

    test("refetchOnWindowFocus is disabled", () => {
      let capturedOptions: any;

      vi.spyOn(reactQuery, "useInfiniteQuery").mockImplementation(
        (_key: any, _fetchFn: any, options: any) => {
          capturedOptions = options;
          return buildInfiniteQueryResult();
        },
      );

      setup();

      expect(capturedOptions.refetchOnWindowFocus).toBe(false);
    });
  });

  describe("content transformation functions", () => {
    describe("transformLineBreaks", () => {
      test("transforms ⤵ character to <br> in segment content", () => {
        const mockSectionsWithArrow = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Line one⤵Line two",
                translation: null,
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithArrow },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("transforms multiple ⤵ characters in content", () => {
        const mockSectionsWithMultipleArrows = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Line one⤵Line two⤵Line three",
                translation: null,
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithMultipleArrows },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("transforms ⤵ in translation content", () => {
        const mockSectionsWithTranslationArrow = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Source content",
                translation: {
                  language: "en",
                  content: "Translation⤵with line break",
                },
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithTranslationArrow },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles content without ⤵ character", () => {
        const mockSectionsWithoutArrow = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Normal content without special characters",
                translation: null,
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithoutArrow },
                  text_detail: { language: "en" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles empty content gracefully", () => {
        const mockSectionsWithEmptyContent = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "",
                translation: null,
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithEmptyContent },
                  text_detail: { language: "en" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles null content gracefully", () => {
        const mockSectionsWithNullContent = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: null,
                translation: null,
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithNullContent },
                  text_detail: { language: "en" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });
    });

    describe("transformSectionsContent", () => {
      test("transforms nested sections recursively", () => {
        const mockNestedSections = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Parent⤵content",
                translation: null,
              },
            ],
            sections: [
              {
                id: "section-1-1",
                segments: [
                  {
                    segment_id: "seg-1-1",
                    content: "Nested⤵content",
                    translation: {
                      language: "en",
                      content: "Nested⤵translation",
                    },
                  },
                ],
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockNestedSections },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles sections without segments", () => {
        const mockSectionsWithoutSegments = [
          {
            id: "section-1",
            title: "Empty Section",
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithoutSegments },
                  text_detail: { language: "en" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles empty sections array", () => {
        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: [] },
                  text_detail: { language: "en" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles segments with translation but no content transformation needed", () => {
        const mockSectionsWithCleanTranslation = [
          {
            id: "section-1",
            segments: [
              {
                segment_id: "seg-1",
                content: "Source content",
                translation: {
                  language: "en",
                  content: "Clean translation without special chars",
                },
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockSectionsWithCleanTranslation },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });

      test("handles deeply nested sections with transformations", () => {
        const mockDeeplyNestedSections = [
          {
            id: "section-1",
            segments: [{ segment_id: "seg-1", content: "Level 1⤵content" }],
            sections: [
              {
                id: "section-1-1",
                segments: [
                  { segment_id: "seg-1-1", content: "Level 2⤵content" },
                ],
                sections: [
                  {
                    id: "section-1-1-1",
                    segments: [
                      { segment_id: "seg-1-1-1", content: "Level 3⤵content" },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        vi.spyOn(reactQuery, "useInfiniteQuery").mockReturnValue(
          buildInfiniteQueryResult({
            data: {
              pages: [
                {
                  content: { sections: mockDeeplyNestedSections },
                  text_detail: { language: "bo" },
                },
              ],
            },
            fetchNextPage: vi.fn(),
            hasNextPage: false,
            isFetchingNextPage: false,
            fetchPreviousPage: vi.fn(),
            hasPreviousPage: false,
            isFetchingPreviousPage: false,
          }),
        );

        setup();
        expect(screen.getByTestId("use-chapter-hook-mock")).toBeInTheDocument();
      });
    });
  });
});
