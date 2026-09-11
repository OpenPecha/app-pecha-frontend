import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, test, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// The shared test setup stubs react-query's useQuery; the hero uses a real one.
vi.mock("react-query", async () => await vi.importActual("react-query"));

vi.mock("@tolgee/react", () => ({
  useTolgee: () => ({ getLanguage: () => "en" }),
  useTranslate: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("../commons/seo/Seo.tsx", () => ({
  __esModule: true,
  default: () => null,
}));

vi.mock("../../components/DownloadAppModal.tsx", () => ({
  __esModule: true,
  default: () => null,
}));

const fetchVerseOfDayToday = vi.fn();
const fetchPublicSeries = vi.fn();
vi.mock("../planviewer/api/plansApi.ts", () => ({
  fetchVerseOfDayToday: (...args: unknown[]) => fetchVerseOfDayToday(...args),
  fetchPublicSeries: (...args: unknown[]) => fetchPublicSeries(...args),
}));

const fetchPresetAccumulators = vi.fn();
const fetchPublicGroups = vi.fn();
vi.mock("../mantras/api/accumulatorApi.ts", () => ({
  fetchPresetAccumulators: (...args: unknown[]) =>
    fetchPresetAccumulators(...args),
  fetchPublicGroups: (...args: unknown[]) => fetchPublicGroups(...args),
}));

const mala = (id: string, title: string) => ({
  id,
  metadata: [{ language: "EN", title, description: "" }],
  mantra: { mantra: `${title} mantra`, mala_image_url: "" },
  mala_image_url: "",
});

import Home from "./Home.tsx";

const renderHome = (initialEntry = "/") =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<div>plans page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  fetchVerseOfDayToday.mockResolvedValue({ verse_of_day: null });
  fetchPublicSeries.mockResolvedValue({
    series: [
      { id: "s-1", metadata: [], image: "https://img.test/a.jpg" },
      { id: "s-2", metadata: [], image: "https://img.test/b.jpg" },
    ],
  });
  fetchPublicGroups.mockResolvedValue({
    total: 128,
    groups: Array.from({ length: 15 }, (_, index) => ({
      id: `g-${index}`,
      metadata: [],
      avatar_url: `https://img.test/g${index}.png`,
    })),
  });
  fetchPresetAccumulators.mockResolvedValue({
    accumulators: [
      mala("m-1", "Chenrezig"),
      mala("m-2", "Tara"),
      mala("m-3", "Guru Rinpoche"),
    ],
  });
});

describe("Home", () => {
  test("introduces plans, mala and groups", async () => {
    renderHome();

    expect(await screen.findByText("A practice that")).toBeInTheDocument();
    expect(screen.getByText("Recitation, counted")).toBeInTheDocument();
    expect(screen.getByText("Practise")).toBeInTheDocument();
  });

  test("explains each one rather than listing what is in it", () => {
    renderHome();

    // Each section describes the category and offers a way in; none of them
    // renders the plans, mantras or groups themselves.
    expect(
      screen.getByRole("link", { name: /See the plans/i }),
    ).toHaveAttribute("href", "/plans");
    expect(screen.getByRole("link", { name: /Find a group/i })).toHaveAttribute(
      "href",
      "/plans?view=groups",
    );
    // The hero's second call to action, which used to be an in-page anchor to a
    // section that has since moved to its own route.
    expect(
      screen.getByRole("link", { name: /Browse practices/i }),
    ).toHaveAttribute("href", "/plans");
    expect(
      screen.getByRole("button", { name: /Get the app/i }),
    ).toBeInTheDocument();
  });

  test("shows a single mala, not the list of them", async () => {
    renderHome();

    const shown = await screen.findAllByRole("button", {
      name: /Download the app to practice/i,
    });

    // The web does not list the malas - one example stands for the rest.
    expect(shown).toHaveLength(1);
    expect(shown[0].textContent).toMatch(/Chenrezig|Tara|Guru Rinpoche/);
  });

  test("shows one plan's artwork, not the plan listing", async () => {
    renderHome();

    // One plan stands for the rest, so exactly one piece of artwork.
    const artwork = await screen.findAllByTestId("plan-artwork");
    expect(artwork).toHaveLength(1);
    expect(artwork[0].getAttribute("src")).toMatch(/\/(a|b)\.jpg$/);
  });

  test("shows the groups as a wall of avatars with the total", async () => {
    renderHome();

    // Scale is the point of this panel - a crowd of groups, said in words
    // rather than quoted as a figure.
    expect(
      await screen.findByText(/A lot of communities/i),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("group-avatar").length).toBeGreaterThan(8);
    expect(screen.queryByText("128")).not.toBeInTheDocument();
  });

  test("falls back to the Buddha image when the day has no verse picture", async () => {
    renderHome();

    // The hero is full-bleed, so it cannot wait on the verse with nothing
    // behind the headline.
    expect(await screen.findByTestId("hero-backdrop")).toHaveAttribute(
      "src",
      "/img/buddha_hero.jpg",
    );
  });

  test("uses the day's verse picture once it arrives", async () => {
    fetchVerseOfDayToday.mockResolvedValue({
      verse_of_day: { image_url: "https://img.test/verse.jpg" },
    });

    renderHome();

    await waitFor(() =>
      expect(screen.getByTestId("hero-backdrop")).toHaveAttribute(
        "src",
        "https://img.test/verse.jpg",
      ),
    );
  });

  test("falls back to the Buddha image when the verse picture fails to load", async () => {
    fetchVerseOfDayToday.mockResolvedValue({
      verse_of_day: { image_url: "https://img.test/gone.jpg" },
    });

    renderHome();

    const backdrop = await screen.findByTestId("hero-backdrop");
    await waitFor(() =>
      expect(backdrop).toHaveAttribute("src", "https://img.test/gone.jpg"),
    );
    fireEvent.error(backdrop);

    expect(screen.getByTestId("hero-backdrop")).toHaveAttribute(
      "src",
      "/img/buddha_hero.jpg",
    );
  });

  test("sends links made before the practice area moved to /plans", () => {
    renderHome("/?series=series-1&plan=plan-1");

    expect(screen.getByText("plans page")).toBeInTheDocument();
  });

  test("stays on the front page when there are no practice params", () => {
    renderHome("/?lang=en");

    expect(screen.queryByText("plans page")).not.toBeInTheDocument();
    expect(screen.getByText("A practice that")).toBeInTheDocument();
  });
});
