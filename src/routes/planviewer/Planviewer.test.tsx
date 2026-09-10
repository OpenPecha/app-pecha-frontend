import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import * as reactQuery from "react-query";
import { mockReactQuery } from "../../test-utils/CommonMocks.ts";

mockReactQuery();

const getLanguageMock = vi.fn();
const fetchPublicSeriesMock = vi.fn();
const fetchVerseOfDayTodayMock = vi.fn();
const fetchSeriesDetailMock = vi.fn();
const fetchPlanDailyMock = vi.fn();
const fetchPlanDayCompletionStatusMock = vi.fn();
const fetchUserSeriesEnrollmentsMock = vi.fn();
const enrollInSeriesMock = vi.fn();

vi.mock("@tolgee/react", () => ({
  useTolgee: () => ({
    getLanguage: getLanguageMock,
  }),
  useTranslate: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock("../../config/AuthContext.tsx", () => ({
  useAuth: () => ({
    isLoggedIn: false,
    isAuthLoading: false,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock("./api/plansApi.ts", () => ({
  fetchPublicSeries: (...args: unknown[]) => fetchPublicSeriesMock(...args),
  fetchVerseOfDayToday: (...args: unknown[]) =>
    fetchVerseOfDayTodayMock(...args),
  fetchSeriesDetail: (...args: unknown[]) => fetchSeriesDetailMock(...args),
  fetchPlanDaily: (...args: unknown[]) => fetchPlanDailyMock(...args),
  fetchPlanDayCompletionStatus: (...args: unknown[]) =>
    fetchPlanDayCompletionStatusMock(...args),
  fetchUserSeriesEnrollments: (...args: unknown[]) =>
    fetchUserSeriesEnrollmentsMock(...args),
  enrollInSeries: (...args: unknown[]) => enrollInSeriesMock(...args),
}));

vi.mock("../../utils/helperFunctions.tsx", async () => {
  const actual = await vi.importActual("../../utils/helperFunctions.tsx");
  return {
    ...actual,
    getEarlyReturn: () => null,
    getLanguageClass: () => "",
  };
});

import Planviewer from "./Planviewer.tsx";

const publicSeries = {
  series: [
    {
      id: "series-1",
      metadata: [
        {
          id: "meta-1",
          title: "200-Day Road to the ITCC 2026",
          sub_title: "Daily Tipitaka",
          description: "Intro series",
          language: "EN",
        },
      ],
      image: { medium: "https://example.com/cover.jpg" },
      featured: true,
      status: "PUBLISHED",
      plan_count: 2,
      total_days: 198,
      enrolled_count: 10,
    },
  ],
  skip: 0,
  limit: 50,
  total: 1,
};

const seriesDetail = {
  id: "series-1",
  metadata: publicSeries.series[0].metadata,
  image: publicSeries.series[0].image,
  featured: true,
  status: "PUBLISHED",
  total_days: 198,
  enrolled_count: 10,
  plans: [
    {
      id: "plan-1",
      title: "ITCC: Days 1-6",
      description: "First week",
      language: "EN",
      difficulty_level: "BEGINNER",
      status: "PUBLISHED",
      featured: false,
      display_order: 1,
      start_date: "2026-05-14T00:00:00Z",
      total_days: 6,
      tags: [],
    },
    {
      id: "plan-2",
      title: "ITCC: Days 7-37",
      description: "Current block",
      language: "EN",
      difficulty_level: "BEGINNER",
      status: "PUBLISHED",
      featured: false,
      display_order: 2,
      start_date: "2026-05-20T00:00:00Z",
      total_days: 31,
      tags: [],
    },
  ],
};

const dailyContent = {
  plan_id: "plan-1",
  plan_title: "ITCC: Days 1-6",
  plan_description: "First week",
  date: "2026-06-19",
  day_number: 1,
  total_days: 6,
  start_date: "2026-05-14",
  end_date: "2026-05-19",
  previous_date: null,
  next_date: "2026-05-15",
  tasks: [
    {
      id: "task-1",
      title: "Morning reading",
      display_order: 1,
      subtasks: [
        {
          id: "sub-1",
          content_type: "TEXT",
          content: "Practice with mindfulness.",
          display_order: 1,
        },
      ],
    },
  ],
};

const verseOfDay = {
  verse_of_day: {
    id: "verse-1",
    verse: "All conditioned things are impermanent.",
    date: "2026-06-19",
  },
};

function renderPlanviewer(initialEntry = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Planviewer />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("Planviewer", () => {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getLanguageMock.mockReturnValue("en");
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    fetchPublicSeriesMock.mockResolvedValue(publicSeries);
    fetchVerseOfDayTodayMock.mockResolvedValue(verseOfDay);
    fetchSeriesDetailMock.mockResolvedValue(seriesDetail);
    fetchPlanDailyMock.mockResolvedValue(dailyContent);
    fetchPlanDayCompletionStatusMock.mockResolvedValue({
      days: [
        { day_number: 1, is_completed: true },
        { day_number: 2, is_completed: false },
      ],
    });
    fetchUserSeriesEnrollmentsMock.mockResolvedValue({ enrollments: [] });
    enrollInSeriesMock.mockResolvedValue(undefined);

    vi.spyOn(reactQuery, "useQuery").mockImplementation(
      (queryKey, _queryFn, options) => {
        const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        if (options?.enabled === false) {
          return { data: undefined, isLoading: false, error: null };
        }
        if (key === "verse-of-day") {
          return { data: verseOfDay, isLoading: false, error: null };
        }
        if (key === "public-series") {
          return { data: publicSeries, isLoading: false, error: null };
        }
        if (key === "series-detail") {
          return { data: seriesDetail, isLoading: false, error: null };
        }
        if (key === "plan-daily") {
          return { data: dailyContent, isLoading: false, error: null };
        }
        if (key === "plan-day-completion") {
          return {
            data: {
              days: [
                { day_number: 1, is_completed: true },
                { day_number: 2, is_completed: false },
              ],
            },
            isLoading: false,
            error: null,
          };
        }
        if (key === "user-series-enrollments") {
          return { data: { enrollments: [] }, isLoading: false, error: null };
        }
        return { data: undefined, isLoading: false, error: null };
      },
    );
  });

  test("renders the public series listing", async () => {
    // The verse of the day and the masthead belong to the front page now; this
    // route is the practice listing.
    renderPlanviewer();

    expect(
      await screen.findByText("200-Day Road to the ITCC 2026"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Verse of the day")).not.toBeInTheDocument();
  });

  test("opens today's plan when a series is selected", async () => {
    renderPlanviewer("/?series=series-1");

    expect(await screen.findByText("ITCC: Days 1-6")).toBeInTheDocument();
    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
    expect(screen.queryByText("Enroll")).not.toBeInTheDocument();
  });

  test("opens daily content when a plan row is selected", async () => {
    renderPlanviewer("/?series=series-1&plan=plan-1");
    const user = userEvent.setup();

    expect(await screen.findByText("ITCC: Days 1-6")).toBeInTheDocument();
    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Morning reading/i }));

    expect(
      await screen.findByText("Practice with mindfulness."),
    ).toBeInTheDocument();
  });

  test("navigates from series card Start button to today's plan", async () => {
    renderPlanviewer();
    const user = userEvent.setup();

    await screen.findByText("200-Day Road to the ITCC 2026");
    await user.click(screen.getByRole("button", { name: /^Start$/i }));

    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
    expect(screen.queryByText("Enroll")).not.toBeInTheDocument();
  });

  test("navigates from series card to chapter list", async () => {
    renderPlanviewer();
    const user = userEvent.setup();

    // The whole tile is the link through to the chapter list now, labelled with
    // the series title, rather than a separate "View chapters" button.
    await screen.findByText("200-Day Road to the ITCC 2026");
    await user.click(
      screen.getByRole("button", { name: "200-Day Road to the ITCC 2026" }),
    );

    expect(await screen.findByText("ITCC: Days 1-6")).toBeInTheDocument();
    expect(await screen.findByText("Enroll")).toBeInTheDocument();
  });

  test("renders the series detail list when view=list", async () => {
    renderPlanviewer("/?series=series-1&view=list");

    expect(
      await screen.findByRole("button", { name: /Enroll/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("ITCC: Days 1-6")).toBeInTheDocument();
    expect(await screen.findByText("ITCC: Days 7-37")).toBeInTheDocument();
  });

  test("selecting a plan from the detail list opens its daily content", async () => {
    renderPlanviewer("/?series=series-1&view=list");
    const user = userEvent.setup();

    const planRow = await screen.findByText("ITCC: Days 1-6");
    await user.click(planRow);

    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
  });

  test("back from a daily plan returns to the series detail list", async () => {
    renderPlanviewer("/?series=series-1&plan=plan-1");
    const user = userEvent.setup();

    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Back to series/i }));

    expect(
      await screen.findByRole("button", { name: /Enroll/i }),
    ).toBeInTheDocument();
  });

  test("changing the day updates the daily content", async () => {
    renderPlanviewer("/?series=series-1&plan=plan-1");
    const user = userEvent.setup();

    expect(await screen.findByText("Morning reading")).toBeInTheDocument();

    const dayButton = await screen.findByRole("button", {
      name: /^Day 2,/i,
    });
    await user.click(dayButton);

    expect(await screen.findByText("Morning reading")).toBeInTheDocument();
  });

  test("back from the detail list keeps the non-English language param", async () => {
    getLanguageMock.mockReturnValue("bo-IN");
    renderPlanviewer("/?series=series-1&view=list&lang=bo");
    const user = userEvent.setup();

    await screen.findByRole("button", { name: /Enroll/i });
    await user.click(screen.getByRole("button", { name: /All routines/i }));

    expect(
      await screen.findByText("200-Day Road to the ITCC 2026"),
    ).toBeInTheDocument();
  });

  test("maps tolgee language codes for backend requests", async () => {
    getLanguageMock.mockReturnValue("bo-IN");

    renderPlanviewer();

    // Anchor on the masthead: it renders whatever the series data turns out to
    // be, unlike the section headings, which depend on how many series there are.
    await waitFor(() => {
      // Anchor on the page header, which renders regardless of how many series
      // come back.
      expect(screen.getByText("Give the day")).toBeInTheDocument();
    });
  });
});
