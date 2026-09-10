import { describe, test, expect, beforeEach, vi } from "vitest";

vi.mock("./api.ts", () => ({
  fetchRelatedSegments: vi.fn(),
  fetchSegmentContent: vi.fn(),
  fetchSegmentDetail: vi.fn(),
  fetchTextById: vi.fn(),
}));

vi.mock("./texts.ts", () => ({
  fetchTextSourceLink: vi.fn(async () => null),
}));

import {
  fetchRelatedSegments,
  fetchSegmentContent,
  fetchSegmentDetail,
  fetchTextById,
} from "./api.ts";
import { getSegmentById, getSegmentTranslations } from "./segments.ts";

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
      items: [{ id: "rel-1", text_id: "text-1" }],
      has_more: false,
      offset: 0,
      limit: 10,
    });

    const result = await getSegmentTranslations({ segmentId: "seg-1" });

    expect(result.parent_segment.content).toBe("oneXX\ntwoYY");
    expect(result.translations[0].segments[0].content).toBe("oneXX\ntwoYY");
  });
});
