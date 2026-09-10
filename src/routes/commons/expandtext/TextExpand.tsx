import { useState } from "react";
import { getLanguageClass } from "../../../utils/helperFunctions";
import { useTranslate } from "@tolgee/react";
const DEFAULT_MAX_LENGTH = 250;

const transformLineBreaks = (content: string): string => {
  if (!content) return content;
  return content.replace(/⤵/g, "<br>");
};

export default function TextExpand({
  children,
  maxLength,
  language,
}: {
  children: string;
  maxLength: number;
  language: string;
}) {
  const { t } = useTranslate();
  const [isExpanded, setIsExpanded] = useState(false);
  if (typeof children !== "string") return null;
  if (children.length === 0) return null;
  const transformedContent = transformLineBreaks(children);
  return (
    <>
      <div
        className={`text-base text-gray-500 whitespace-pre-line ${getLanguageClass(language)}`}
        dangerouslySetInnerHTML={{
          __html: isExpanded
            ? transformedContent
            : `${transformedContent.substring(0, Number(maxLength) || DEFAULT_MAX_LENGTH)}`,
        }}
      />
      {children.length > maxLength && (
        <button
          className="text-sm text-faded-grey transition hover:text-red-700 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? t("panel.showless") : t("panel.showmore")}
        </button>
      )}
    </>
  );
}
