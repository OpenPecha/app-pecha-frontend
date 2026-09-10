import { fetchContentSearch, fetchEdition, fetchTextById } from "./api.ts";
import { extractTitle } from "./mappers.ts";

/**
 * Ask upstream for its maximum window rather than a multiple of `limit`.
 * Roughly half the content-search index points at deleted editions, and those
 * orphans rank in among the live hits, so a narrow window can come back
 * entirely unopenable and leave the reader with nothing.
 */
const MAX_EXTERNAL_SEARCH_LIMIT = 100;

/**
 * Caps how many edition/text lookups run at once. A single search can touch up
 * to MAX_EXTERNAL_SEARCH_LIMIT distinct editions, and firing all of them
 * together would stall behind the browser's per-host connection limit.
 */
const MAX_CONCURRENT_LOOKUPS = 10;

export type TextIndex = {
  text_id: string;
  language: string;
  title: string;
  published_date: string;
};

export type MultilingualSegmentMatch = {
  segment_id: string;
  content: string;
  relevance_score: number;
  pecha_segment_id: string;
};

export type MultilingualSourceResult = {
  text: TextIndex;
  segment_matches: MultilingualSegmentMatch[];
};

export type MultilingualSearchResponse = {
  query: string;
  search_type: string;
  sources: MultilingualSourceResult[];
  skip: number;
  limit: number;
  total: number;
};

type ContentSearchHit = {
  score?: number;
  context?: string;
  text_id?: string;
  edition_id?: string;
  segment_ids?: string[];
};

type FlatMatch = {
  text_id: string;
  edition_id: string;
  pecha_segment_id: string;
  content: string;
  relevance_score: number;
};

const mapWithLimit = async <T, R>(
  items: T[],
  worker: (item: T) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(MAX_CONCURRENT_LOOKUPS, items.length) },
    async () => {
      for (;;) {
        const index = cursor++;
        if (index >= items.length) return;
        results[index] = await worker(items[index]);
      }
    },
  );
  await Promise.all(runners);
  return results;
};

/**
 * Flatten content-search hits into one entry per segment.
 *
 * A hit covers a matched span and can straddle several segments, so the same
 * segment can appear under more than one hit; only its best hit is kept. Scores
 * are negated so ascending order puts the most relevant match first.
 */
export const flattenContentSearchMatches = (
  hits: ContentSearchHit[],
): FlatMatch[] => {
  const matches: FlatMatch[] = [];
  const indexBySegment = new Map<string, number>();

  hits.forEach((hit) => {
    const relevanceScore = -(hit.score ?? 0);
    (hit.segment_ids ?? []).forEach((segmentId) => {
      if (!segmentId) return;
      const match: FlatMatch = {
        text_id: hit.text_id ?? "",
        edition_id: hit.edition_id ?? "",
        pecha_segment_id: segmentId,
        content: hit.context ?? "",
        relevance_score: relevanceScore,
      };
      const existing = indexBySegment.get(segmentId);
      if (existing === undefined) {
        indexBySegment.set(segmentId, matches.length);
        matches.push(match);
      } else if (relevanceScore < matches[existing].relevance_score) {
        matches[existing] = match;
      }
    });
  });

  return matches.sort((a, b) => a.relevance_score - b.relevance_score);
};

/**
 * Keep only the editions the library can still open.
 *
 * The content-search index outlives deleted texts, so hits can point at
 * editions the graph no longer has. They render fine in a result list but 404
 * the moment the reader clicks one. Fails open: only a definite 404 rules an
 * edition out, so an upstream blip never silently empties a page.
 */
const filterLiveEditionIds = async (
  editionIds: string[],
): Promise<Set<string>> => {
  const unique = [...new Set(editionIds.filter(Boolean))];
  if (unique.length === 0) return new Set();

  const live = await mapWithLimit(unique, async (editionId) => {
    try {
      return (await fetchEdition(editionId)) !== null;
    } catch {
      return true;
    }
  });

  return new Set(unique.filter((_, index) => live[index]));
};

const placeholderTextIndex = (textId: string): TextIndex => ({
  text_id: textId,
  language: "",
  title: "",
  published_date: "",
});

const fetchTextInfo = async (
  textIds: string[],
): Promise<Map<string, TextIndex>> => {
  const unique = [...new Set(textIds.filter(Boolean))];
  if (unique.length === 0) return new Map();

  const payloads = await mapWithLimit(unique, async (textId) => {
    try {
      // A 404 here is routine when the search index is ahead of the graph.
      return await fetchTextById(textId);
    } catch {
      return null;
    }
  });

  const map = new Map<string, TextIndex>();
  unique.forEach((textId, index) => {
    const payload = payloads[index];
    if (!payload) return;
    const language = payload.language ?? "";
    map.set(textId, {
      text_id: textId,
      language,
      title: extractTitle(payload.title, language),
      published_date: String(payload.date ?? ""),
    });
  });
  return map;
};

const applyPaginationToSources = (
  sources: MultilingualSourceResult[],
  skip: number,
  limit: number,
): MultilingualSourceResult[] => {
  const all = sources.flatMap((source) =>
    source.segment_matches.map(
      (match) => [source.text, match] as [TextIndex, MultilingualSegmentMatch],
    ),
  );
  all.sort((a, b) => a[1].relevance_score - b[1].relevance_score);

  const grouped = new Map<string, MultilingualSourceResult>();
  all.slice(skip, skip + limit).forEach(([text, match]) => {
    let entry = grouped.get(text.text_id);
    if (!entry) {
      entry = { text, segment_matches: [] };
      grouped.set(text.text_id, entry);
    }
    entry.segment_matches.push(match);
  });
  return [...grouped.values()];
};

const emptyResponse = (
  query: string,
  searchType: string,
  skip: number,
  limit: number,
): MultilingualSearchResponse => ({
  query,
  search_type: searchType,
  sources: [],
  skip,
  limit,
  total: 0,
});

const buildSources = async (
  matches: FlatMatch[],
): Promise<MultilingualSourceResult[]> => {
  // The response's `text.text_id` reports the edition id, not the text id, so
  // results are grouped by edition even though metadata is fetched by text id.
  const matchesByEdition = new Map<string, MultilingualSegmentMatch[]>();
  const textIdByEdition = new Map<string, string>();
  const editionIds: string[] = [];

  matches.forEach((match) => {
    const editionId = match.edition_id || match.text_id;
    if (!editionId || !match.text_id) return;
    if (!matchesByEdition.has(editionId)) {
      matchesByEdition.set(editionId, []);
      textIdByEdition.set(editionId, match.text_id);
      editionIds.push(editionId);
    }
    matchesByEdition.get(editionId)!.push({
      segment_id: match.pecha_segment_id,
      content: match.content,
      relevance_score: match.relevance_score,
      pecha_segment_id: match.pecha_segment_id,
    });
  });

  if (editionIds.length === 0) return [];

  const live = await filterLiveEditionIds(editionIds);
  const liveEditionIds = editionIds.filter((id) => live.has(id));
  if (liveEditionIds.length === 0) return [];

  const textInfo = await fetchTextInfo(
    liveEditionIds.map((id) => textIdByEdition.get(id) ?? ""),
  );

  return liveEditionIds.map((editionId) => {
    const segmentMatches = [...matchesByEdition.get(editionId)!].sort(
      (a, b) => a.relevance_score - b.relevance_score,
    );
    const info = textInfo.get(textIdByEdition.get(editionId) ?? "");
    return {
      text: info
        ? { ...info, text_id: editionId }
        : placeholderTextIndex(editionId),
      segment_matches: segmentMatches,
    };
  });
};

export const multilingualSearch = async (params: {
  query: string;
  searchType?: string;
  textId?: string | null;
  editionId?: string | null;
  skip?: number;
  limit?: number;
}): Promise<MultilingualSearchResponse> => {
  const searchType = params.searchType ?? "similar";
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 10;

  // Upstream scopes by whichever id it is given: `text_id` covers every edition
  // of a work, `edition_id` narrows to one. They are distinct ids, so passing a
  // text id as an edition id matches nothing.
  const raw = await fetchContentSearch({
    query: params.query,
    search_type: searchType,
    limit: MAX_EXTERNAL_SEARCH_LIMIT,
    text_id: params.textId,
    edition_id: params.editionId,
  });

  if (!Array.isArray(raw)) {
    return emptyResponse(params.query, searchType, skip, limit);
  }

  const matches = flattenContentSearchMatches(raw as ContentSearchHit[]);
  if (matches.length === 0) {
    return emptyResponse(params.query, searchType, skip, limit);
  }

  const sources = await buildSources(matches);
  if (sources.length === 0) {
    return emptyResponse(params.query, searchType, skip, limit);
  }

  return {
    query: params.query,
    search_type: searchType,
    sources: applyPaginationToSources(sources, skip, limit),
    skip,
    limit,
    // Counts the openable matches only, so `total` agrees with what paging
    // through the sources actually yields.
    total: sources.reduce(
      (sum, source) => sum + source.segment_matches.length,
      0,
    ),
  };
};
