import { describe, test, expect, beforeEach, vi } from "vitest";

vi.mock("./api.ts", () => ({
  fetchRelatedSegments: vi.fn(),
  fetchSegmentContent: vi.fn(),
  fetchSegmentDetail: vi.fn(),
  fetchTextById: vi.fn(),
}));

vi.mock("./texts.ts", async (importOriginal) => ({
  ...((await importOriginal()) as object),
  fetchTextSourceLink: vi.fn(async () => null),
}));

import {
  fetchRelatedSegments,
  fetchSegmentContent,
  fetchSegmentDetail,
  fetchTextById,
} from "./api.ts";
import {
  getSegmentById,
  getSegmentInfo,
  getSegmentTranslations,
} from "./segments.ts";

const mocked = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const detail = (lines: [number, number][], textId = "text-1") => ({
  id: "seg-1",
  text_id: textId,
  edition_id: "edition-1",
  segmentation_id: "segmentation-1",
  lines: lines.map(([start, end]) => ({ start, end })),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocked(fetchTextById).mockResolvedValue({
    id: "text-1",
    title: { en: "A Text" },
    language: "en",
    category_id: "cat-1",
    translation_of: "root-1",
  });
});

describe("segment line breaks", () => {
  test("splits the run-on content back into its lines", async () => {
    // /segments/{id}/content hands back the lines already concatenated.
    mocked(fetchSegmentContent).mockResolvedValue("oneXXtwoYYthree");
    mocked(fetchSegmentDetail).mockResolvedValue(
      detail([
        [100, 105],
        [105, 110],
        [110, 115],
      ]),
    );

    const result = await getSegmentById("seg-1");

    expect(result.content).toBe("oneXX\ntwoYY\nthree");
  });

  test("leaves a single-line segment alone", async () => {
    mocked(fetchSegmentContent).mockResolvedValue("just one line");
    mocked(fetchSegmentDetail).mockResolvedValue(detail([[0, 13]]));

    const result = await getSegmentById("seg-1");

    expect(result.content).toBe("just one line");
  });

  test("keeps the original text when the spans do not add up", async () => {
    // Line lengths total 10, the content is 15 - splitting would lose text, so
    // the API's own answer is kept instead.
    mocked(fetchSegmentContent).mockResolvedValue("oneXXtwoYYthree");
    mocked(fetchSegmentDetail).mockResolvedValue(
      detail([
        [0, 5],
        [5, 10],
      ]),
    );

    const result = await getSegmentById("seg-1");

    expect(result.content).toBe("oneXXtwoYYthree");
  });

  test("survives the detail lookup failing", async () => {
    mocked(fetchSegmentContent).mockResolvedValue("oneXXtwoYY");
    mocked(fetchSegmentDetail).mockRejectedValue(new Error("upstream down"));

    const result = await getSegmentById("seg-1");

    expect(result.content).toBe("oneXXtwoYY");
  });

  test("a missing segment is a 404", async () => {
    mocked(fetchSegmentContent).mockResolvedValue(null);
    mocked(fetchSegmentDetail).mockResolvedValue(null);

    await expect(getSegmentById("seg-1")).rejects.toMatchObject({
      status: 404,
    });
  });

  test("related segments in the panel get their lines too", async () => {
    mocked(fetchSegmentContent).mockResolvedValue("oneXXtwoYY");
    mocked(fetchSegmentDetail).mockResolvedValue(
      detail([
        [0, 5],
        [5, 10],
      ]),
    );
    mocked(fetchRelatedSegments).mockResolvedValue({
      items: [{ id: "rel-1", text_id: "text-2" }],
      has_more: false,
      offset: 0,
      limit: 10,
    });

    const result = await getSegmentTranslations({ segmentId: "seg-1" });

    expect(result.parent_segment.content).toBe("oneXX\ntwoYY");
    expect(result.translations[0].segments[0].content).toBe("oneXX\ntwoYY");
  });
});

describe("relations from anywhere in a family", () => {
  /**
   * The relationship lists live only on the root: a translation carries an empty
   * `translations`/`commentaries` and just a pointer back to what it translates.
   */
  const family = {
    root: {
      id: "root",
      title: { bo: "Root" },
      language: "bo",
      category_id: "cat-1",
      translations: ["fr", "zh"],
      commentaries: ["comm"],
      translation_of: null,
      commentary_of: null,
    },
    fr: {
      id: "fr",
      title: { fr: "French" },
      language: "fr",
      category_id: "cat-1",
      translations: [],
      commentaries: [],
      translation_of: "root",
      commentary_of: null,
    },
    zh: {
      id: "zh",
      title: { zh: "Chinese" },
      language: "zh",
      category_id: "cat-1",
      translations: [],
      commentaries: [],
      translation_of: "root",
      commentary_of: null,
    },
  };

  beforeEach(() => {
    mocked(fetchTextById).mockImplementation(
      async (id: string) => (family as Record<string, unknown>)[id] ?? null,
    );
  });

  test("the panel counts a translation's whole family, not its empty lists", async () => {
    mocked(fetchSegmentDetail).mockResolvedValue(detail([[0, 5]], "fr"));

    const result = await getSegmentInfo("seg-1");

    // Was 0/0 before, which hid both panel buttons even though the related
    // lookup behind them had the root, the sibling and the commentary to show.
    expect(result.segment_info).toMatchObject({
      text_id: "fr",
      translations: 2, // the root it translates, plus the zh sibling
      related_text: { commentaries: 1, root_text: 1 },
    });
  });

  test("the root counts its own family without counting itself", async () => {
    mocked(fetchSegmentDetail).mockResolvedValue(detail([[0, 5]], "root"));

    const result = await getSegmentInfo("seg-1");

    expect(result.segment_info).toMatchObject({
      translations: 2,
      related_text: { commentaries: 1, root_text: 0 },
    });
  });

  test("the text being read is not listed among its own relations", async () => {
    mocked(fetchSegmentContent).mockResolvedValue("text");
    mocked(fetchSegmentDetail).mockResolvedValue(detail([[0, 4]], "fr"));
    mocked(fetchRelatedSegments).mockResolvedValue({
      items: [
        // Another segment of the very text being read, which the related
        // lookup also returns.
        { id: "own-2", text_id: "fr" },
        { id: "rel-1", text_id: "zh" },
      ],
      has_more: false,
      offset: 0,
      limit: 10,
    });

    const result = await getSegmentTranslations({ segmentId: "seg-1" });

    expect(result.translations.map((g) => g.text_id)).toEqual(["zh"]);
  });
});
