import { fetchCategories } from "./api.ts";
import type {
  CollectionModel,
  CollectionsResponse,
  LibraryCategory,
  LocalizedTitle,
} from "./types.ts";

const localized = (
  value: LocalizedTitle | null | undefined,
  language: string,
): string => value?.[language] ?? value?.en ?? "";

const toCollection = (
  category: LibraryCategory,
  language: string,
): CollectionModel => {
  const title = localized(category.title, language);
  return {
    id: category.id,
    pecha_collection_id: category.id,
    title,
    description: localized(category.description, language),
    has_child: (category.children?.length ?? 0) > 0,
    language,
    slug: title || category.id,
  };
};

/**
 * The library returns every category for a parent in one response, so paging is
 * applied here - the same way the backend did it.
 */
export const getCollections = async (params: {
  parentId?: string | null;
  language?: string | null;
  skip?: number;
  limit?: number;
}): Promise<CollectionsResponse> => {
  const language = params.language?.trim().toLowerCase() || "en";
  const skip = params.skip ?? 0;
  const limit = params.limit ?? 10;

  const categories =
    (await fetchCategories({ parent_id: params.parentId, language })) ?? [];
  const collections = categories.map((category) =>
    toCollection(category, language),
  );

  let parent: CollectionModel | null = null;
  if (params.parentId) {
    // The parent is not part of its own children listing, so it comes from the
    // top-level listing, matching the backend's lookup.
    const roots = (await fetchCategories({ language })) ?? [];
    const match = roots.find((category) => category.id === params.parentId);
    parent = match ? toCollection(match, language) : null;
  }

  return {
    parent,
    pagination: { total: collections.length, skip, limit },
    collections: collections.slice(skip, skip + limit),
  };
};
