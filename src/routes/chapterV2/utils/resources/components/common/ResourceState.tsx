import React from "react";
import { useTranslate } from "@tolgee/react";
import { Skeleton } from "@/components/ui/skeleton";

type ResourceStateProps = {
  isLoading: boolean;
  isError?: unknown;
  isEmpty: boolean;
  children: React.ReactNode;
};

/**
 * Loading, error and empty states for a resources-panel list.
 *
 * These lists previously rendered their data and nothing else, so a panel that
 * was still fetching was indistinguishable from one with nothing to show - both
 * were simply blank. The counts on the panel buttons are text-level while these
 * lists are segment-level, so "nothing to show" is a real outcome (front matter,
 * for instance, is rarely aligned to anything) and needs saying out loud.
 */
const ResourceState = ({
  isLoading,
  isError,
  isEmpty,
  children,
}: ResourceStateProps) => {
  const { t } = useTranslate();

  if (isLoading) {
    return (
      <output aria-busy="true" className="block space-y-4">
        <span className="sr-only">{t("common.loading", "Loading...")}</span>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </output>
    );
  }

  if (isError) {
    return (
      <p className="overalltext text-sm text-gray-600">
        {t("message.there_is_error", "Sorry, there was an error.")}
      </p>
    );
  }

  if (isEmpty) {
    return (
      <p className="overalltext text-sm text-gray-500">
        {t(
          "sheet.no_connection_found",
          "No connections known for this source.",
        )}
      </p>
    );
  }

  return <>{children}</>;
};

export default ResourceState;
