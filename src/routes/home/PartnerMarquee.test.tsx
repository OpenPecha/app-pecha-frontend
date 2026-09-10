import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, test, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";

// The shared test setup stubs react-query's useQuery; this uses a real one.
vi.mock("react-query", async () => await vi.importActual("react-query"));

vi.mock("@tolgee/react", () => ({
  useTranslate: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

const fetchPublicGroups = vi.fn();
vi.mock("../mantras/api/accumulatorApi.ts", () => ({
  fetchPublicGroups: (...args: unknown[]) => fetchPublicGroups(...args),
}));

import PartnerMarquee from "./PartnerMarquee.tsx";

const groupsOf = (count: number) => ({
  total: count,
  groups: Array.from({ length: count }, (_, index) => ({
    id: `g-${index}`,
    metadata: [],
    avatar_url: `https://img.test/g${index}.png`,
  })),
});

const renderMarquee = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <PartnerMarquee apiLanguage="en" language="EN" />
    </QueryClientProvider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PartnerMarquee", () => {
  test("renders every partner it is given", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(10));

    const { container } = renderMarquee();

    await waitFor(() =>
      expect(container.querySelectorAll("li").length).toBeGreaterThan(0),
    );
    // Two runs of ten: the second is the copy that makes the loop seamless.
    expect(container.querySelectorAll("li")).toHaveLength(20);
  });

  test("announces the partners once, not twice", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(10));

    const { container } = renderMarquee();

    await waitFor(() =>
      expect(container.querySelectorAll("ul")).toHaveLength(2),
    );
    const [first, duplicate] = Array.from(container.querySelectorAll("ul"));
    expect(first).not.toHaveAttribute("aria-hidden");
    expect(duplicate).toHaveAttribute("aria-hidden", "true");
  });

  test("holds still when there are too few partners to loop", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(3));

    const { container } = renderMarquee();

    await waitFor(() =>
      expect(container.querySelectorAll("li")).toHaveLength(3),
    );
    // No duplicate run, and no animation to run it.
    expect(container.querySelectorAll("ul")).toHaveLength(1);
    expect(container.querySelector(".animate-marquee")).toBeNull();
  });

  test("renders nothing at all when there are no partners", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(0));

    const { container } = renderMarquee();

    await waitFor(() => expect(fetchPublicGroups).toHaveBeenCalled());
    expect(container).toBeEmptyDOMElement();
  });

  test("paces itself by how many partners there are", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(20));

    const { container } = renderMarquee();

    await waitFor(() =>
      expect(container.querySelector(".animate-marquee")).not.toBeNull(),
    );
    // 20 partners at three seconds each, rather than a fixed duration that
    // would crawl for a long list and race through a short one.
    expect(
      container.querySelector(".animate-marquee")?.getAttribute("style"),
    ).toContain("60s");
  });

  test("labels the strip for anyone who cannot see it", async () => {
    fetchPublicGroups.mockResolvedValue(groupsOf(10));

    renderMarquee();

    expect(
      await screen.findByRole("region", { name: /Groups practising with us/i }),
    ).toBeInTheDocument();
  });
});
