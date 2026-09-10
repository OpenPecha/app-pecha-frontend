import React, { createContext, useContext, useMemo } from "react";
import { useQuery } from "react-query";
import { useTranslate } from "@tolgee/react";
import { getLanguageLabelKey } from "../utils/helperFunctions.tsx";
import { libraryGet } from "../services/library/client.ts";

export type ApiLanguage = {
  code: string;
  name: string;
};

/**
 * The catalogue of languages the library actually serves, fetched through the
 * same proxied client as the rest of the library API.
 */
export const fetchLanguages = async (): Promise<ApiLanguage[]> => {
  const data = await libraryGet<ApiLanguage[]>(
    "/v2/languages",
    undefined,
    "languages",
  );
  return Array.isArray(data) ? data : [];
};

const LanguagesContext = createContext<ApiLanguage[]>([]);

export const LanguagesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data } = useQuery("languages", fetchLanguages, {
    // The catalogue changes rarely; one fetch per hour per session is plenty.
    staleTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  return (
    <LanguagesContext.Provider value={data ?? []}>
      {children}
    </LanguagesContext.Provider>
  );
};

const toTitleCase = (name: string) =>
  name.replace(/\b\w/g, (character) => character.toUpperCase());

/**
 * Returns a resolver that turns an API language code into a display label.
 *
 * Order of preference:
 *  1. the translated `language.*` label, when we ship one for the code;
 *  2. the English name from /v2/languages, so codes added by the backend
 *     (`pi`, `lzh`, …) still render before we have a translation for them;
 *  3. the raw code, so a badge is never blank.
 *
 * Without a LanguagesProvider above it this degrades to steps 1 and 3, which
 * keeps it usable in isolation.
 */
export const useLanguageLabel = () => {
  const { t } = useTranslate();
  const languages = useContext(LanguagesContext);

  const namesByCode = useMemo(() => {
    const names = new Map<string, string>();
    languages.forEach(({ code, name }) => {
      if (code && name) names.set(code.trim().toLowerCase(), name);
    });
    return names;
  }, [languages]);

  return useMemo(
    () =>
      (language?: string | null): string => {
        if (!language) return "";

        const labelKey = getLanguageLabelKey(language);
        if (labelKey) return t(labelKey);

        const normalized = language.trim().toLowerCase();
        const apiName =
          namesByCode.get(normalized) ??
          namesByCode.get(normalized.split("-")[0]);

        return apiName ? toTitleCase(apiName) : language;
      },
    [namesByCode, t],
  );
};
