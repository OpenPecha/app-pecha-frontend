import { useTranslate } from "@tolgee/react";
import { LANGUAGE, siteName } from "../../utils/constants.ts";
import { useQuery } from "react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  getEarlyReturn,
  getLanguageClass,
  mapLanguageCode,
} from "../../utils/helperFunctions.tsx";
import Seo from "../commons/seo/Seo.tsx";
import { useCollectionColor } from "../../context/CollectionColorContext.tsx";
import clsx from "clsx";
import { Button } from "@/components/ui/button.tsx";
import TwoColumnLayout from "../../components/layout/TwoColumnLayout";
import CompactCollections from "../chapterV2/utils/resources/components/compare-text/CompactCollections.tsx";
import { getCollections } from "@/services/library";

type Collection = {
  id: string;
  title: string;
  description: string;
  language?: string;
  has_child?: boolean;
};

type CollectionsResponse = {
  collections: Collection[];
  pagination: { total: number; skip: number; limit: number };
};

type CollectionsProps = {
  setRendererInfo?: (updater: (prev: any) => any) => void;
  isCompactView?: boolean;
};

type CollectionColorContextValue = {
  setCollectionColor: (color: string) => void;
};

export const fetchCollections = async (): Promise<CollectionsResponse> => {
  const storedLanguage = localStorage.getItem(LANGUAGE);
  const language = storedLanguage ? mapLanguageCode(storedLanguage) : "en";
  return getCollections({ language, limit: 50, skip: 0 });
};

const Collections = (props: CollectionsProps) => {
  const { setRendererInfo, isCompactView = false } = props;
  const navigate = useNavigate();
  const { t } = useTranslate();
  const { setCollectionColor } =
    useCollectionColor() as CollectionColorContextValue;
  const {
    data: collectionsData,
    isLoading: collectionsIsLoading,
    error: collectionsError,
  } = useQuery<CollectionsResponse>(["collections"], () => fetchCollections(), {
    refetchOnWindowFocus: false,
  });

  // ----------------------------- helpers ---------------------------------------
  const siteBaseUrl = window.location.origin;
  const canonicalUrl = `${siteBaseUrl}${window.location.pathname}`;
  const earlyReturn = getEarlyReturn({
    isLoading: collectionsIsLoading,
    error: collectionsError,
    t,
  });
  if (earlyReturn) return earlyReturn;

  const collectionColors = [
    "#802F3E",
    "#5B99B7",
    "#5D956F",
    "#004E5F",
    "#594176",
    "#7F85A9",
    "#D4896C",
    "#C6A7B4",
    "#CCB478",
  ];

  const getColorFromIndex = (index: number) =>
    collectionColors[index % collectionColors.length];

  const handleCollectionClick = (index: number) => {
    setCollectionColor(getColorFromIndex(index));
  };

  const renderCollectionNames = (collection: Collection, index: number) => {
    const sharedClasses = clsx(
      "block w-full text-left wrap-break-word text-lg",
      getLanguageClass(collection.language || "en"),
    );

    if (setRendererInfo) {
      const handleSelect = () => {
        handleCollectionClick(index);
        setRendererInfo((prev: any) => ({
          ...prev,
          requiredId: collection.id,
          renderer: collection.has_child ? "sub-collections" : "works",
        }));
      };

      return (
        <button
          type="button"
          className={clsx(sharedClasses, "cursor-pointer")}
          onClick={handleSelect}
        >
          {collection.title}
        </button>
      );
    }

    const targetPath = collection.has_child
      ? `/collections/${collection.id}`
      : `/works/${collection.id}`;

    return (
      <Link
        to={targetPath}
        className={sharedClasses}
        onClick={() => handleCollectionClick(index)}
      >
        {collection.title}
      </Link>
    );
  };

  if (isCompactView) {
    return (
      <CompactCollections
        collectionsData={collectionsData}
        renderCollectionNames={renderCollectionNames}
        getColorFromIndex={getColorFromIndex}
        handleCollectionClick={handleCollectionClick}
      />
    );
  }

  return (
    <TwoColumnLayout
      main={
        <div className="max-w-2xl space-y-4 mx-auto pt-10">
          <Seo
            title={`${siteName} - Buddhism in your own words`}
            description="Explore Buddhist texts, collections, and community discussions. Create notes, track your studies, and share insights."
            canonical={canonicalUrl}
          />
          <h2 className="text-lg text-start overalltext font-semibold text-faded-grey">
            {t("home.browse_text")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {collectionsData?.collections.map(
              (collection: Collection, index: number) => (
                <div className="w-full" key={collection.id}>
                  <div
                    className="h-1 w-full mb-4"
                    style={{ backgroundColor: getColorFromIndex(index) }}
                  />
                  {renderCollectionNames(collection, index)}
                  <p className="content text-left text-faded-grey text-sm m-0 wrap-break-word">
                    {collection.description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      }
      sidebar={
        <div>
          {[
            {
              titleKey: "side_nav.about_pecha_title",
              bodyKey: "side_nav.about_pecha_description",
            },
            {
              titleKey: "side_nav.community.join_conversation",
              bodyKey: "side_nav.collection.description",
            },
          ].map(({ titleKey, bodyKey }, index) => (
            <div key={titleKey} className={index > 0 ? "mt-4" : ""}>
              <h2 className=" overalltext text-start font-bold text-faded-grey border-b py-2">
                {t(titleKey)}
              </h2>
              <p className="text-sm leading-loose text-start overalltext text-faded-grey my-2">
                {t(bodyKey)}
              </p>
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => navigate("/note")}
            className="w-full mt-4 overalltext text-faded-grey text-sm"
          >
            {t("side_nav.community.join_conversation")}
          </Button>
        </div>
      }
    />
  );
};

export default Collections;
