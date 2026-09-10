import React from "react";
import {
  mockAxios,
  mockReactQuery,
  mockTolgee,
  mockUseAuth,
  mockLocalStorage,
} from "../../test-utils/CommonMocks.ts";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { TolgeeProvider } from "@tolgee/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router, useParams } from "react-router-dom";
import * as reactRouterDom from "react-router-dom";
import Collections, { fetchCollections } from "./Collections.tsx";
import { vi, beforeEach, describe, test, expect } from "vitest";
import "@testing-library/jest-dom";

import { getCollections } from "@/services/library";
mockAxios();
mockUseAuth();
mockReactQuery();

vi.mock("@/services/library", () => ({
  getCollections: vi.fn(),
}));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: (key) => key,
    }),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock("../../utils/helperFunctions.tsx", () => ({
  mapLanguageCode: (code) => (code === "bo-IN" ? "bo" : code),
  getEarlyReturn: () => null,
  getLanguageClass: (language) => (language === "bo" ? "tibetan-font" : ""),
}));

vi.mock("../../utils/constants.ts", () => ({
  LANGUAGE: "LANGUAGE",
  siteName: "WeBuddhist",
}));

const setCollectionColorMock = vi.fn();
vi.mock("../../context/CollectionColorContext.tsx", () => ({
  useCollectionColor: () => ({ setCollectionColor: setCollectionColorMock }),
}));

describe("Collections Component", () => {
  const queryClient = new QueryClient();
  const mockCollectionsData = {
    collections: [
      {
        id: "1",
        title: "content.title.words_of_buddha",
        description: "content.subtitle.words_of_buddha",
      },
      {
        id: "2",
        title: "content.title.liturgy",
        description: "content.subtitle.prayers_rutuals",
      },
      {
        id: "3",
        title: "content.title.Buddhavacana",
        description: "content.subtitle.buddhavacana",
      },
    ],
    total: 3,
    skip: 0,
    limit: 10,
  };

  let localStorageMock;

  beforeEach(() => {
    vi.resetAllMocks();
    useParams.mockReturnValue({ id: null });
    localStorageMock = mockLocalStorage();
    localStorageMock.getItem.mockReturnValue("bo-IN");
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: mockCollectionsData,
      isLoading: false,
    }));
  });

  const setup = () => {
    return render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
  };

  test("renders Collections component", () => {
    setup();
    expect(screen.getByText("home.browse_text")).toBeInTheDocument();
    expect(screen.getByText("side_nav.about_pecha_title")).toBeInTheDocument();
    expect(
      screen.getByText("content.title.words_of_buddha"),
    ).toBeInTheDocument();
  });

  test("does not display loading state when data is being fetched", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("home.browse_text")).toBeInTheDocument();
    expect(screen.getByText("side_nav.about_pecha_title")).toBeInTheDocument();
  });

  test("handles language selection correctly", () => {
    window.localStorage.getItem.mockReturnValue("en-US");
    const useQuerySpy = vi.spyOn(reactQuery, "useQuery");
    setup();
    expect(useQuerySpy).toHaveBeenCalled();
  });

  test("renders the browse section correctly", () => {
    setup();
    expect(screen.getByText("home.browse_text")).toBeInTheDocument();
    expect(screen.getByText("side_nav.about_pecha_title")).toBeInTheDocument();
  });

  test("renders the content section correctly", () => {
    setup();
    expect(
      screen.getByText("content.title.words_of_buddha"),
    ).toBeInTheDocument();
    expect(screen.getByText("content.title.liturgy")).toBeInTheDocument();
    expect(
      screen.getByText("content.subtitle.words_of_buddha"),
    ).toBeInTheDocument();
  });

  test("renders the about section correctly", () => {
    setup();
    expect(screen.getByText("side_nav.about_pecha_title")).toBeInTheDocument();
    expect(
      screen.getAllByText("side_nav.community.join_conversation"),
    ).toHaveLength(2);
    expect(
      screen.getByText("side_nav.about_pecha_description"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("side_nav.collection.description"),
    ).toBeInTheDocument();
  });

  test("renders correct number of collections from data", () => {
    const customCollectionsData = {
      collections: [
        { id: "1", title: "Term 1", description: "Description 1" },
        { id: "2", title: "Term 2", description: "Description 2" },
        { id: "3", title: "Term 3", description: "Description 3" },
        { id: "4", title: "Term 4", description: "Description 4" },
      ],
      total: 4,
      skip: 0,
      limit: 10,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: customCollectionsData,
      isLoading: false,
    }));

    setup();

    expect(screen.getByText("Term 1")).toBeInTheDocument();
    expect(screen.getByText("Term 2")).toBeInTheDocument();
    expect(screen.getByText("Term 3")).toBeInTheDocument();
    expect(screen.getByText("Term 4")).toBeInTheDocument();

    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
    expect(screen.getByText("Description 3")).toBeInTheDocument();
    expect(screen.getByText("Description 4")).toBeInTheDocument();
  });

  test("handles async data loading correctly", async () => {
    let isLoadingValue = true;
    let dataValue = null;

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: dataValue,
      isLoading: isLoadingValue,
    }));

    const { rerender } = setup();

    isLoadingValue = false;
    dataValue = mockCollectionsData;

    rerender(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );
    expect(
      screen.getByText("content.title.words_of_buddha"),
    ).toBeInTheDocument();
  });

  test("handles null data gracefully", () => {
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data: null,
      isLoading: false,
    }));

    setup();
    expect(screen.getByText("home.browse_text")).toBeInTheDocument();
    expect(screen.getByText("side_nav.about_pecha_title")).toBeInTheDocument();
    expect(
      screen.queryByText("content.title.words_of_buddha"),
    ).not.toBeInTheDocument();
  });

  test("fetches collections with correct parameters", async () => {
    window.localStorage.getItem.mockReturnValue("en");
    (getCollections as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockCollectionsData,
    );
    const result = await fetchCollections();
    expect(window.localStorage.getItem).toHaveBeenCalledWith("LANGUAGE");
    expect(getCollections).toHaveBeenCalledWith({
      language: "en",
      limit: 50,
      skip: 0,
    });
    expect(result).toEqual(mockCollectionsData);
  });

  test("sets collection color based on index", () => {
    const data = {
      collections: [
        { id: "c1", title: "A", description: "d1", has_child: true },
        { id: "c2", title: "B", description: "d2", has_child: false },
        { id: "c3", title: "C", description: "d3", has_child: true },
      ],
      total: 3,
      skip: 0,
      limit: 10,
    };
    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );

    const links = screen.getAllByRole("link", { name: /A|B|C/ });
    fireEvent.click(links[0]);
    fireEvent.click(links[1]);
    fireEvent.click(links[2]);
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(1, "#802F3E");
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(2, "#5B99B7");
    expect(setCollectionColorMock).toHaveBeenNthCalledWith(3, "#5D956F");
  });

  test("embedded mode: renders button and triggers callbacks", () => {
    const data = {
      collections: [
        { id: "c1", title: "Compare A", description: "d1", has_child: false },
      ],
      total: 1,
      skip: 0,
      limit: 10,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    const setRendererInfo = vi.fn();

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections setRendererInfo={setRendererInfo} />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );

    const link = screen.getByRole("button", { name: "Compare A" });
    fireEvent.click(link);

    expect(setCollectionColorMock).toHaveBeenCalledWith("#802F3E");
    expect(setRendererInfo).toHaveBeenCalledTimes(1);
    const updater = setRendererInfo.mock.calls[0][0];
    expect(typeof updater).toBe("function");
    const prev = { foo: "bar" };
    const next = updater(prev);
    expect(next).toEqual({ foo: "bar", requiredId: "c1", renderer: "works" });
  });

  test("renders correct link targets based on has_child", () => {
    const data = {
      collections: [
        { id: "c1", title: "With Child", description: "d1", has_child: true },
        { id: "w1", title: "Leaf", description: "d2", has_child: false },
      ],
      total: 2,
      skip: 0,
      limit: 10,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <TolgeeProvider fallback={"Loading tolgee..."} tolgee={mockTolgee}>
            <Collections />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>,
    );

    const withChildLink = screen.getByRole("link", { name: "With Child" });
    const leafLink = screen.getByRole("link", { name: "Leaf" });
    expect(withChildLink.getAttribute("href")).toBe("/collections/c1");
    expect(leafLink.getAttribute("href")).toBe("/works/w1");
  });

  test("navigates to note when Explore Stories is clicked", () => {
    const navigateMock = vi.fn();
    const useNavigateSpy = vi
      .spyOn(reactRouterDom, "useNavigate")
      .mockReturnValue(navigateMock);

    setup();
    const button = screen.getByRole("button", {
      name: "side_nav.community.join_conversation",
    });
    fireEvent.click(button);

    expect(navigateMock).toHaveBeenCalledWith("/note");
    useNavigateSpy.mockRestore();
  });

  test("renders correct line classes for indices 0-8 and sets 9th color", () => {
    const data = {
      collections: Array.from({ length: 9 }, (_, i) => ({
        id: `c${i}`,
        title: `T${i}`,
        description: `D${i}`,
        has_child: i % 2 === 0,
      })),
      total: 9,
      skip: 0,
      limit: 10,
    };

    vi.spyOn(reactQuery, "useQuery").mockImplementation(() => ({
      data,
      isLoading: false,
    }));

    setup();
    fireEvent.click(screen.getByRole("link", { name: "T0" }));
    expect(setCollectionColorMock).toHaveBeenLastCalledWith("#802F3E");

    fireEvent.click(screen.getByRole("link", { name: "T4" }));
    expect(setCollectionColorMock).toHaveBeenLastCalledWith("#594176");

    fireEvent.click(screen.getByRole("link", { name: "T8" }));
    expect(setCollectionColorMock).toHaveBeenLastCalledWith("#CCB478");
  });
});
