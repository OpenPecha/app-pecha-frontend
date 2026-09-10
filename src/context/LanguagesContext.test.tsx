import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { libraryGet } from "../services/library/client.ts";
import { LanguagesProvider, useLanguageLabel } from "./LanguagesContext.tsx";

// The shared test setup stubs react-query's useQuery; this suite exercises the
// real query so the provider's fetch-and-cache path is covered.
vi.mock("react-query", async () => await vi.importActual("react-query"));

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({ t: (key: string) => key }),
  };
});

vi.mock("../services/library/client.ts", () => ({
  libraryGet: vi.fn(),
}));

const API_LANGUAGES = [
  { code: "bo", name: "tibetan" },
  { code: "en", name: "english" },
  { code: "lzh", name: "classical chinese" },
  { code: "pi", name: "pali" },
  { code: "vi", name: "vietnamese" },
];

const Probe = ({ codes }: { codes: (string | null)[] }) => {
  const languageLabel = useLanguageLabel();
  return (
    <ul>
      {codes.map((code, index) => (
        <li key={index} data-testid={`label-${index}`}>
          {languageLabel(code)}
        </li>
      ))}
    </ul>
  );
};

const renderWithProvider = (codes: (string | null)[]) =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <LanguagesProvider>
        <Probe codes={codes} />
      </LanguagesProvider>
    </QueryClientProvider>,
  );

describe("useLanguageLabel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (libraryGet as any).mockResolvedValue(API_LANGUAGES);
  });

  test("prefers the translated label for codes we ship a translation for", async () => {
    renderWithProvider(["bo", "en", "vi", "hi", "mn", "ne", "zh"]);

    await waitFor(() => expect(libraryGet).toHaveBeenCalled());

    expect(screen.getByTestId("label-0")).toHaveTextContent("language.tibetan");
    expect(screen.getByTestId("label-1")).toHaveTextContent("language.english");
    expect(screen.getByTestId("label-2")).toHaveTextContent(
      "language.vietnamese",
    );
    expect(screen.getByTestId("label-3")).toHaveTextContent("language.hindi");
    expect(screen.getByTestId("label-4")).toHaveTextContent(
      "language.mongolian",
    );
    expect(screen.getByTestId("label-5")).toHaveTextContent("language.nepali");
    expect(screen.getByTestId("label-6")).toHaveTextContent("language.chinese");
  });

  test("falls back to the API name for codes with no translation", async () => {
    renderWithProvider(["lzh", "pi"]);

    await waitFor(() =>
      expect(screen.getByTestId("label-0")).toHaveTextContent(
        "Classical Chinese",
      ),
    );
    expect(screen.getByTestId("label-1")).toHaveTextContent("Pali");
  });

  test("normalizes region tags and casing", async () => {
    renderWithProvider(["bo-IN", "EN", " zh "]);

    await waitFor(() => expect(libraryGet).toHaveBeenCalled());

    expect(screen.getByTestId("label-0")).toHaveTextContent("language.tibetan");
    expect(screen.getByTestId("label-1")).toHaveTextContent("language.english");
    expect(screen.getByTestId("label-2")).toHaveTextContent("language.chinese");
  });

  test("falls back to the raw code for a language nothing knows about", async () => {
    renderWithProvider(["xx"]);

    await waitFor(() => expect(libraryGet).toHaveBeenCalled());

    expect(screen.getByTestId("label-0")).toHaveTextContent("xx");
  });

  test("renders an empty label rather than crashing on a missing code", async () => {
    renderWithProvider([null, ""]);

    await waitFor(() => expect(libraryGet).toHaveBeenCalled());

    expect(screen.getByTestId("label-0")).toBeEmptyDOMElement();
    expect(screen.getByTestId("label-1")).toBeEmptyDOMElement();
  });

  test("still resolves shipped translations when the endpoint fails", async () => {
    (libraryGet as any).mockRejectedValue(new Error("network down"));

    renderWithProvider(["bo", "lzh"]);

    await waitFor(() => expect(libraryGet).toHaveBeenCalled());

    expect(screen.getByTestId("label-0")).toHaveTextContent("language.tibetan");
    // No translation and no catalogue to fall back on, so the code shows.
    expect(screen.getByTestId("label-1")).toHaveTextContent("lzh");
  });
});
