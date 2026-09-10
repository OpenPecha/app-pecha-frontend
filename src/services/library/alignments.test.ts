import { describe, test, expect, beforeEach, vi } from "vitest";

vi.mock("./api.ts", () => ({
  fetchAlignmentPairs: vi.fn(),
  fetchTextEditions: vi.fn(),
}));

import { fetchAlignmentPairs, fetchTextEditions } from "./api.ts";
import {
  clearAlignmentCache,
  resolveTranslationSegmentIds,
} from "./alignments.ts";
import type { LibraryText } from "./types.ts";

const mocked = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const asText = (fixture: Partial<LibraryText> & { id: string }): LibraryText =>
  ({
    title: {},
    language: "en",
    category_id: "cat",
    translations: [],
    commentaries: [],
    ...fixture,
  }) as LibraryText;

/**
 * Stand in for the alignment endpoint: `edges` maps "source->target" to the
 * segment pairs stored in that direction.
 */
const alignments = (edges: Record<string, [string, string][]>) => {
  mocked(fetchAlignmentPairs).mockImplementation(
    async (source: string, target: string) => {
      const pairs = edges[`${source}->${target}`];
      if (!pairs) return null;
      return {
        items: pairs.map(([s, t]) => ({
          source_segment: { id: s },
          target_segment: { id: t },
        })),
        has_more: false,
        offset: 0,
        limit: 500,
      };
    },
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  clearAlignmentCache();
  mocked(fetchTextEditions).mockResolvedValue([]);
});

describe("resolveTranslationSegmentIds", () => {
  test("uses a direct alignment when one exists", async () => {
    alignments({
      "ed-a->ed-b": [
        ["a1", "b1"],
        ["a2", "b2"],
      ],
    });

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1", "a2"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect(result.get("a1")).toEqual(["b1"]);
    expect(result.get("a2")).toEqual(["b2"]);
  });

  test("falls back to an alignment stored the other way round", async () => {
    alignments({ "ed-b->ed-a": [["b1", "a1"]] });

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect(result.get("a1")).toEqual(["b1"]);
  });

  test("collects several target segments for one source segment", async () => {
    alignments({
      "ed-a->ed-b": [
        ["a1", "b1"],
        ["a1", "b2"],
      ],
    });

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect(result.get("a1")).toEqual(["b1", "b2"]);
  });

  test("composes two translations through their shared root edition", async () => {
    // Neither translation is aligned to the other; both are aligned to the root.
    alignments({
      "ed-fr->ed-root": [["f1", "r1"]],
      "ed-zh->ed-root": [["z1", "r1"]],
    });
    mocked(fetchTextEditions).mockResolvedValue([
      { id: "ed-root", text_id: "t-root" },
    ]);

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["f1"],
      editionId: "ed-fr",
      editionTextId: "t-fr",
      editionText: asText({ id: "t-fr", translation_of: "t-root" }),
      versionEditionId: "ed-zh",
      versionTextId: "t-zh",
      versionText: asText({ id: "t-zh", translation_of: "t-root" }),
    });

    expect(result.get("f1")).toEqual(["z1"]);
  });

  test("gives up when the two texts share no root", async () => {
    alignments({});

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a", translation_of: "root-1" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b", translation_of: "root-2" }),
    });

    expect(result.size).toBe(0);
  });

  test("a missing alignment is an ordinary empty result, not an error", async () => {
    alignments({});

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect(result.size).toBe(0);
  });

  test("segments outside the alignment's coverage are simply skipped", async () => {
    alignments({ "ed-a->ed-b": [["a1", "b1"]] });

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1", "a2"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect([...result.keys()]).toEqual(["a1"]);
  });

  test("pages through a long alignment list", async () => {
    mocked(fetchAlignmentPairs).mockImplementation(
      async (_s: string, _t: string, _limit: number, offset: number) =>
        offset === 0
          ? {
              items: [
                { source_segment: { id: "a1" }, target_segment: { id: "b1" } },
              ],
              has_more: true,
              offset: 0,
              limit: 500,
            }
          : {
              items: [
                { source_segment: { id: "a2" }, target_segment: { id: "b2" } },
              ],
              has_more: false,
              offset: 1,
              limit: 500,
            },
    );

    const result = await resolveTranslationSegmentIds({
      segmentIds: ["a1", "a2"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    });

    expect(result.get("a2")).toEqual(["b2"]);
  });

  test("caches a pair list so paging the reader does not refetch it", async () => {
    alignments({ "ed-a->ed-b": [["a1", "b1"]] });
    const args = {
      segmentIds: ["a1"],
      editionId: "ed-a",
      editionTextId: "t-a",
      editionText: asText({ id: "t-a" }),
      versionEditionId: "ed-b",
      versionTextId: "t-b",
      versionText: asText({ id: "t-b" }),
    };

    await resolveTranslationSegmentIds(args);
    const callsAfterFirst = mocked(fetchAlignmentPairs).mock.calls.length;
    await resolveTranslationSegmentIds(args);

    expect(mocked(fetchAlignmentPairs).mock.calls.length).toBe(callsAfterFirst);
  });
});
