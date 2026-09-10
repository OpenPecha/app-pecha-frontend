import {
  fetchRelatedSegments,
  fetchSegmentContent,
  fetchSegmentDetail,
  fetchTextById,
} from "./api.ts";
import { LibraryError } from "./client.ts";
import { extractTitle } from "./mappers.ts";
import { fetchTextSourceLink } from "./texts.ts";
import type {
  LibraryRelatedSegment,
  LibraryText,
  ParentSegment,
  V2SegmentCommentariesResponse,
  V2SegmentInfoResponse,
  V2SegmentResponse,
  V2SegmentRootTextResponse,
  V2SegmentTextGroup,
  V2SegmentTranslationsResponse,
} from "./types.ts";

const TRANSLATION = "translation";
const COMMENTARY = "commentary";
const MAX_SKIP = 10000;
const MAX_LIMIT = 100;

/** A related text is a translation or a commentary, depending which pointer it carries. */
const classifyText = (text: LibraryText | null | undefined): string | null => {
  if (!text) return null;
  if (text.translation_of) return TRANSLATION;
  if (text.commentary_of) return COMMENTARY;
  return null;
};

const fetchTextSafe = async (
  textId: string | null | undefined,
): Promise<LibraryText | null> => {
  if (!textId) return null;
  try {
    return await fetchTextById(textId);
  } catch {
    return null;
  }
};

/**
 * A segment's text with its line breaks restored.
 *
 * /segments/{id}/content returns the segment's lines already run together, which
 * turns a four-line verse into one run-on line. The segment's own `lines` spans
 * say where the breaks fall, and the content is exactly those spans
 * concatenated - so their lengths alone are enough to split it back up, with no
 * need to fetch the edition content.
 */
const splitIntoLines = (
  content: string,
  lines: { start: number; end: number }[],
): string => {
  if (lines.length < 2) return content;

  // Code points, not UTF-16 units: the spans are measured the way Python counts.
  const characters = Array.from(content);
  const parts: string[] = [];
  let offset = 0;
  for (const line of lines) {
    const length = line.end - line.start;
    parts.push(characters.slice(offset, offset + length).join(""));
    offset += length;
  }

  // If the spans do not account for exactly the text we were given, the split
  // cannot be trusted - hand back what the API said rather than mangling it.
  return offset === characters.length ? parts.join("\n") : content;
};

const fetchContentSafe = async (segmentId: string): Promise<string | null> => {
  try {
    const [content, detail] = await Promise.all([
      fetchSegmentContent(segmentId),
      fetchSegmentDetail(segmentId).catch(() => null),
    ]);
    if (content === null || content === undefined) return null;
    return splitIntoLines(content, detail?.lines ?? []);
  } catch {
    return null;
  }
};

const fetchParentSegment = async (
  segmentId: string,
): Promise<ParentSegment> => {
  const content = await fetchContentSafe(segmentId);
  if (content === null) {
    throw new LibraryError(`Segment with id '${segmentId}' not found`, 404);
  }
  return { segment_id: segmentId, content };
};

const uniqueTextIds = (items: LibraryRelatedSegment[]): string[] => [
  ...new Set(
    items
      .map((item) => item.text_id)
      .filter((textId): textId is string => Boolean(textId)),
  ),
];

const relatedSegmentsGroupedByType = async (args: {
  segmentId: string;
  relatedType: string;
  skip: number;
  limit: number;
}): Promise<{
  parentSegment: ParentSegment;
  groups: V2SegmentTextGroup[];
  hasMore: boolean;
}> => {
  const [parentSegment, relatedPage] = await Promise.all([
    fetchParentSegment(args.segmentId),
    fetchRelatedSegments(args.segmentId, {
      limit: args.limit,
      offset: args.skip,
    }),
  ]);

  const items = relatedPage.items ?? [];
  const hasMore = Boolean(relatedPage.has_more);
  if (items.length === 0) return { parentSegment, groups: [], hasMore };

  const textIds = uniqueTextIds(items);
  const [texts, sourceLinks] = await Promise.all([
    Promise.all(textIds.map((textId) => fetchTextSafe(textId))),
    Promise.all(textIds.map((textId) => fetchTextSourceLink(textId))),
  ]);
  const textById = new Map(textIds.map((textId, i) => [textId, texts[i]]));
  const sourceById = new Map(
    textIds.map((textId, i) => [textId, sourceLinks[i]]),
  );

  const filtered = items.filter(
    (item) =>
      classifyText(textById.get(item.text_id ?? "")) === args.relatedType,
  );
  if (filtered.length === 0) return { parentSegment, groups: [], hasMore };

  const contents = await Promise.all(
    filtered.map((item) => fetchContentSafe(item.id)),
  );

  const grouped = new Map<string, V2SegmentTextGroup>();
  filtered.forEach((item, index) => {
    const textId = item.text_id;
    if (!textId) return;
    let group = grouped.get(textId);
    if (!group) {
      const text = textById.get(textId);
      group = {
        text_id: textId,
        title: extractTitle(text?.title),
        language: text?.language ?? null,
        source_link: sourceById.get(textId) ?? null,
        license: text?.license ?? null,
        segments: [],
      };
      grouped.set(textId, group);
    }
    group.segments.push({ id: item.id, content: contents[index] });
  });

  return { parentSegment, groups: [...grouped.values()], hasMore };
};

export const getSegmentTranslations = async (params: {
  segmentId: string;
  skip?: number;
  limit?: number;
}): Promise<V2SegmentTranslationsResponse> => {
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 10;
  const { parentSegment, groups, hasMore } = await relatedSegmentsGroupedByType(
    {
      segmentId: params.segmentId,
      relatedType: TRANSLATION,
      skip,
      limit,
    },
  );
  return {
    parent_segment: parentSegment,
    translations: groups,
    skip,
    limit,
    has_more: hasMore,
  };
};

export const getSegmentCommentaries = async (params: {
  segmentId: string;
  skip?: number;
  limit?: number;
}): Promise<V2SegmentCommentariesResponse> => {
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 10;
  const { parentSegment, groups, hasMore } = await relatedSegmentsGroupedByType(
    {
      segmentId: params.segmentId,
      relatedType: COMMENTARY,
      skip,
      limit,
    },
  );
  return {
    parent_segment: parentSegment,
    commentaries: groups,
    skip,
    limit,
    has_more: hasMore,
  };
};

/**
 * Callers do not know a segment's root text ahead of time, so resolve it from
 * the segment's own text's translation_of/commentary_of pointer - the inverse of
 * the direction classifyText uses.
 */
const resolveRootTextId = async (segmentId: string): Promise<string | null> => {
  const detail = await fetchSegmentDetail(segmentId);
  if (!detail) return null;
  const text = await fetchTextById(detail.text_id);
  if (!text) return null;
  return text.translation_of ?? text.commentary_of ?? null;
};

export const getSegmentRootText = async (params: {
  segmentId: string;
  textId?: string | null;
  skip?: number;
  limit?: number;
}): Promise<V2SegmentRootTextResponse> => {
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 10;

  const textId = params.textId ?? (await resolveRootTextId(params.segmentId));

  if (!textId) {
    return {
      parent_segment: await fetchParentSegment(params.segmentId),
      root_text: [],
      skip,
      limit,
      has_more: false,
    };
  }

  const [parentSegment, relatedPage] = await Promise.all([
    fetchParentSegment(params.segmentId),
    fetchRelatedSegments(params.segmentId, {
      limit: Math.max(1, Math.min(limit, MAX_LIMIT)),
      offset: Math.max(0, Math.min(skip, MAX_SKIP)),
      text_id: textId,
    }),
  ]);

  const items = relatedPage.items ?? [];
  const hasMore = Boolean(relatedPage.has_more);
  if (items.length === 0) {
    return {
      parent_segment: parentSegment,
      root_text: [],
      skip,
      limit,
      has_more: hasMore,
    };
  }

  const [text, contents] = await Promise.all([
    fetchTextSafe(textId),
    Promise.all(items.map((item) => fetchContentSafe(item.id))),
  ]);

  return {
    parent_segment: parentSegment,
    root_text: [
      {
        text_id: textId,
        title: extractTitle(text?.title),
        language: text?.language ?? null,
        segments: items.map((item, index) => ({
          id: item.id,
          content: contents[index],
        })),
      },
    ],
    skip,
    limit,
    has_more: hasMore,
  };
};

export const getSegmentById = async (
  segmentId: string,
): Promise<V2SegmentResponse> => {
  // One lookup for both the text and its line spans, rather than fetching the
  // segment's detail again inside fetchContentSafe.
  const [rawContent, detail] = await Promise.all([
    fetchSegmentContent(segmentId).catch(() => null),
    fetchSegmentDetail(segmentId).catch(() => null),
  ]);
  if (rawContent === null || rawContent === undefined) {
    throw new LibraryError(`Segment with id '${segmentId}' not found`, 404);
  }
  const content = splitIntoLines(rawContent, detail?.lines ?? []);

  const text = await fetchTextSafe(detail?.text_id);

  return {
    segment_id: segmentId,
    content,
    text: text
      ? {
          text_id: detail?.text_id ?? "",
          title: extractTitle(text.title),
          language: text.language ?? null,
        }
      : null,
  };
};

export const getSegmentInfo = async (
  segmentId: string,
): Promise<V2SegmentInfoResponse> => {
  const detail = await fetchSegmentDetail(segmentId);
  if (!detail) {
    throw new LibraryError(`Segment with id '${segmentId}' not found`, 404);
  }

  const textId = detail.text_id;
  if (!textId) {
    throw new LibraryError(`Text ID not found for segment '${segmentId}'`, 404);
  }

  const text = await fetchTextById(textId);
  if (!text) {
    throw new LibraryError(`Text with id '${textId}' not found`, 404);
  }

  return {
    segment_info: {
      segment_id: segmentId,
      text_id: textId,
      translations: (text.translations ?? []).length,
      related_text: {
        commentaries: (text.commentaries ?? []).length,
        root_text: text.commentary_of || text.translation_of ? 1 : 0,
      },
      resources: { sheets: 0 },
    },
  };
};
