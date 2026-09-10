import { fetchAlignmentPairs, fetchTextEditions } from "./api.ts";
import type { LibraryText } from "./types.ts";

export type AlignmentPair = {
  source_segment_id: string;
  target_segment_id: string;
};

const PAGE_SIZE = 500;

/**
 * Alignment pairs between two editions, cached for the session.
 *
 * The library has no way to ask for the alignments of just the segments on
 * screen, so every page of the reader would otherwise re-download the whole
 * pair list for the same two editions. The list is stable, so cache it.
 */
const pairCache = new Map<string, Promise<AlignmentPair[]>>();

const fetchAllPairs = async (
  sourceEditionId: string,
  targetEditionId: string,
): Promise<AlignmentPair[]> => {
  const all: AlignmentPair[] = [];
  let offset = 0;

  for (;;) {
    const page = await fetchAlignmentPairs(
      sourceEditionId,
      targetEditionId,
      PAGE_SIZE,
      offset,
    );
    // Two editions are not always aligned directly - two translations of the
    // same root text are typically each aligned only to that shared root - so a
    // missing alignment is an ordinary outcome, not an error.
    if (!page) return all;

    const items = page.items ?? [];
    items.forEach((item) => {
      all.push({
        source_segment_id: item.source_segment.id,
        target_segment_id: item.target_segment.id,
      });
    });

    if (!page.has_more || items.length === 0) return all;
    offset += items.length;
  }
};

export const getAlignmentPairs = (
  sourceEditionId: string,
  targetEditionId: string,
): Promise<AlignmentPair[]> => {
  const key = `${sourceEditionId}->${targetEditionId}`;
  const cached = pairCache.get(key);
  if (cached) return cached;

  const pending = fetchAllPairs(sourceEditionId, targetEditionId).catch(
    (error) => {
      pairCache.delete(key);
      throw error;
    },
  );
  pairCache.set(key, pending);
  return pending;
};

const groupBy = (
  pairs: AlignmentPair[],
  keyOf: (pair: AlignmentPair) => string,
  valueOf: (pair: AlignmentPair) => string,
): Map<string, string[]> => {
  const grouped = new Map<string, string[]>();
  pairs.forEach((pair) => {
    const key = keyOf(pair);
    const existing = grouped.get(key);
    if (existing) existing.push(valueOf(pair));
    else grouped.set(key, [valueOf(pair)]);
  });
  return grouped;
};

const pick = (
  segmentIds: string[],
  grouped: Map<string, string[]>,
): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  segmentIds.forEach((segmentId) => {
    const found = grouped.get(segmentId);
    if (found) result.set(segmentId, found);
  });
  return result;
};

/**
 * Two translations of the same root text are usually only aligned to that shared
 * root edition, not to each other. Find an edition that both sides are (or are
 * translations of), so their segments can be composed through it.
 */
const resolvePivotEditionId = async (args: {
  editionId: string;
  editionTextId: string;
  editionRootTextId: string;
  versionEditionId: string;
  versionTextId: string;
  versionRootTextId: string;
}): Promise<string | null> => {
  if (args.editionRootTextId !== args.versionRootTextId) return null;
  if (args.editionTextId === args.editionRootTextId) return args.editionId;
  if (args.versionTextId === args.versionRootTextId) {
    return args.versionEditionId;
  }
  const editions = await fetchTextEditions(args.editionRootTextId);
  return editions?.[0]?.id ?? null;
};

/** segment id in `editionId` -> its aligned segment id in `pivotEditionId`. */
const mapSegmentIdsToPivot = async (
  segmentIds: string[],
  editionId: string,
  pivotEditionId: string,
): Promise<Map<string, string>> => {
  if (editionId === pivotEditionId) {
    return new Map(segmentIds.map((id) => [id, id]));
  }
  const pairs = await getAlignmentPairs(editionId, pivotEditionId);
  const bySource = new Map(
    pairs.map((pair) => [pair.source_segment_id, pair.target_segment_id]),
  );
  const result = new Map<string, string>();
  segmentIds.forEach((segmentId) => {
    const target = bySource.get(segmentId);
    if (target) result.set(segmentId, target);
  });
  return result;
};

/** segment id in `pivotEditionId` -> the aligned segment id(s) in `versionId`. */
const mapPivotIdsToVersionSegments = async (
  pivotSegmentIds: string[],
  pivotEditionId: string,
  versionEditionId: string,
): Promise<Map<string, string[]>> => {
  if (versionEditionId === pivotEditionId) {
    return new Map(pivotSegmentIds.map((id) => [id, [id]]));
  }
  const pairs = await getAlignmentPairs(versionEditionId, pivotEditionId);
  return pick(
    pivotSegmentIds,
    groupBy(
      pairs,
      (pair) => pair.target_segment_id,
      (pair) => pair.source_segment_id,
    ),
  );
};

const resolveViaPivot = async (args: {
  segmentIds: string[];
  editionId: string;
  editionTextId: string;
  editionRootTextId: string;
  versionEditionId: string;
  versionTextId: string;
  versionText: LibraryText;
}): Promise<Map<string, string[]>> => {
  const versionRootTextId =
    args.versionText.translation_of ?? args.versionTextId;

  const pivotEditionId = await resolvePivotEditionId({
    editionId: args.editionId,
    editionTextId: args.editionTextId,
    editionRootTextId: args.editionRootTextId,
    versionEditionId: args.versionEditionId,
    versionTextId: args.versionTextId,
    versionRootTextId,
  });
  if (!pivotEditionId) return new Map();

  const editionToPivot = await mapSegmentIdsToPivot(
    args.segmentIds,
    args.editionId,
    pivotEditionId,
  );
  if (editionToPivot.size === 0) return new Map();

  const pivotToVersion = await mapPivotIdsToVersionSegments(
    [...editionToPivot.values()],
    pivotEditionId,
    args.versionEditionId,
  );

  const result = new Map<string, string[]>();
  editionToPivot.forEach((pivotId, segmentId) => {
    const targets = pivotToVersion.get(pivotId);
    if (targets) result.set(segmentId, targets);
  });
  return result;
};

/**
 * Map each of `segmentIds` (segments of `editionId`) to the segment id(s) that
 * hold its translation in `versionEditionId`, cheapest path first:
 *   1. a direct alignment from edition to version
 *   2. the same alignment stored the other way round
 *   3. composing through a shared translation root
 */
export const resolveTranslationSegmentIds = async (args: {
  segmentIds: string[];
  editionId: string;
  editionTextId: string;
  editionText: LibraryText;
  versionEditionId: string;
  versionTextId: string;
  versionText: LibraryText;
}): Promise<Map<string, string[]>> => {
  const direct = await getAlignmentPairs(args.editionId, args.versionEditionId);
  if (direct.length > 0) {
    const result = pick(
      args.segmentIds,
      groupBy(
        direct,
        (pair) => pair.source_segment_id,
        (pair) => pair.target_segment_id,
      ),
    );
    if (result.size > 0) return result;
  }

  const reverse = await getAlignmentPairs(
    args.versionEditionId,
    args.editionId,
  );
  if (reverse.length > 0) {
    const result = pick(
      args.segmentIds,
      groupBy(
        reverse,
        (pair) => pair.target_segment_id,
        (pair) => pair.source_segment_id,
      ),
    );
    if (result.size > 0) return result;
  }

  return resolveViaPivot({
    segmentIds: args.segmentIds,
    editionId: args.editionId,
    editionTextId: args.editionTextId,
    editionRootTextId: args.editionText.translation_of ?? args.editionTextId,
    versionEditionId: args.versionEditionId,
    versionTextId: args.versionTextId,
    versionText: args.versionText,
  });
};

/** Exposed for tests: drop the session-level alignment cache. */
export const clearAlignmentCache = () => pairCache.clear();
