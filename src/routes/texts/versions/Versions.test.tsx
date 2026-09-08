import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import "@testing-library/jest-dom";
import { mockTolgee } from "../../../test-utils/CommonMocks.ts";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import Versions from "./Versions.tsx";
import { vi, beforeEach, describe, test, expect } from "vitest";

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("../../../utils/helperFunctions.jsx", async (importOriginal) => ({
  ...(await importOriginal()),
  getLanguageClass: (lang) => `language-${lang}`,
  getEarlyReturn: ({ isLoading, error, t }) => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error occurred</div>;
    return null;
  },
}));

const mockCloseResourcesPanel = vi.fn();
vi.mock("@/context/PanelContext.tsx", () => ({
  usePanelContext: () => ({
    closeResourcesPanel: mockCloseResourcesPanel,
  }),
}));

describe("Versions Component", () => {
  const mockVersionsData = {
    versions: [
      {
        id: "version1",
        title: "Version 1 Title",
        language: "bo",
        table_of_contents: ["content1"],
      },
      {
        id: "version2",
        title: "Version 2 Title",
        language: "en",
        table_of_contents: ["content2"],
      },
      {
        id: "version3",
        title: "Version 3 Title",
        language: "sa",
        table_of_contents: ["content3"],
      },
    ],
  };

  const defaultProps = {
    contentId: "123",
    versions: mockVersionsData,
    versionsIsLoading: false,
    versionsIsError: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props = {}) => {
    const mergedProps = {
      ...defaultProps,
      ...props,
    };

    return render(
      <Router>
        <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
          <Versions {...mergedProps} />
        </TolgeeProvider>
      </Router>,
    );
  };

  describe("Component rendering", () => {
    test("displays loading state when data is loading", () => {
      setup({
        versionsIsLoading: true,
        versions: { versions: [] },
      });

      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    test("displays error state when there's an error", () => {
      setup({
        versionsIsError: new Error("API Error"),
        versions: { versions: [] },
      });

      expect(screen.getByText("Error occurred")).toBeInTheDocument();
    });

    test("displays correct language translations", () => {
      setup();

      expect(screen.getByText("language.tibetan")).toBeInTheDocument();
      expect(screen.getByText("language.english")).toBeInTheDocument();
      expect(screen.getByText("language.sanskrit")).toBeInTheDocument();
    });

    test("displays not found message when no versions exist", () => {
      setup({
        versions: { versions: [] },
      });

      expect(screen.getByText("global.not_found")).toBeInTheDocument();
    });

    test("renders version titles", () => {
      setup();

      expect(screen.getByText("Version 1 Title")).toBeInTheDocument();
      expect(screen.getByText("Version 2 Title")).toBeInTheDocument();
      expect(screen.getByText("Version 3 Title")).toBeInTheDocument();
    });
  });

  describe("Component behavior", () => {
    test("handles empty versions array", () => {
      setup({
        versions: { versions: [] },
      });

      expect(screen.getByText("global.not_found")).toBeInTheDocument();
    });

    test("component is memoized", () => {
      expect(Versions.$$typeof).toBeDefined();
    });

    test("renders with contentId prop", () => {
      setup({ contentId: "prop-123" });

      expect(screen.getByText("Version 1 Title")).toBeInTheDocument();
    });

    test("calls addChapter with just textId when a version is clicked, even without table_of_contents", () => {
      const mockAddChapter = vi.fn();
      const currentChapter = { textId: "current-1" };
      const versionsWithoutToc = {
        versions: [
          { id: "version1", title: "Version 1 Title", language: "bo" },
        ],
      };

      setup({
        versions: versionsWithoutToc,
        contentId: undefined,
        addChapter: mockAddChapter,
        currentChapter,
      });

      fireEvent.click(screen.getByText("Version 1 Title"));

      expect(mockAddChapter).toHaveBeenCalledWith(
        { textId: "version1" },
        currentChapter,
      );
      expect(mockCloseResourcesPanel).toHaveBeenCalled();
    });
  });

  describe("Version metadata rendering", () => {
    test("renders version source_link when available", () => {
      const versionsWithMetadata = {
        versions: [
          {
            id: "version1",
            title: "Version 1",
            language: "bo",
            table_of_contents: ["content1"],
            source_link: "Test Source",
            license: "CC BY 4.0",
          },
        ],
      };

      setup({ versions: versionsWithMetadata });

      expect(screen.getByText("Source: Test Source")).toBeInTheDocument();
      expect(screen.getByText("License: CC BY 4.0")).toBeInTheDocument();
    });

    test("does not render source when source_link is null", () => {
      const versionsWithoutSource = {
        versions: [
          {
            id: "version1",
            title: "Version 1",
            language: "bo",
            table_of_contents: ["content1"],
            source_link: null,
            license: null,
          },
        ],
      };

      setup({ versions: versionsWithoutSource });

      expect(screen.queryByText(/Source:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/License:/)).not.toBeInTheDocument();
    });
  });

  describe("Version links", () => {
    test("renders links to chapter page with correct params", () => {
      setup({ contentId: "main-content" });

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);

      expect(links[0]).toHaveAttribute(
        "href",
        "/chapter?text_id=version1&content_id=content1",
      );
    });

    test("omits content_id when the version has no table of contents", () => {
      setup({
        versions: {
          versions: [
            {
              id: "version1",
              title: "Version 1 Title",
              language: "bo",
            },
          ],
        },
      });

      expect(screen.getByRole("link")).toHaveAttribute(
        "href",
        "/chapter?text_id=version1",
      );
    });
  });

  describe("Versions with text property", () => {
    test("renders text version when provided", () => {
      const versionsWithText = {
        versions: [],
        text: {
          id: "main-text",
          title: "Main Text Title",
          language: "bo",
        },
      };

      setup({ versions: versionsWithText, contentId: "content-123" });

      expect(screen.getByText("Main Text Title")).toBeInTheDocument();
    });
  });
});
