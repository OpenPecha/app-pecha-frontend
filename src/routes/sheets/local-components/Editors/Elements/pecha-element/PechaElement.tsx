import { useQuery } from "react-query";
import pechaIcon from "../../../../../../assets/icons/pecha_icon.png";
import { removeFootnotes } from "../../../../sheet-utils/Constant.ts";
import { getLanguageClass } from "../../../../../../utils/helperFunctions.tsx";
import { getSegmentById } from "@/services/library";

type PechaElementProps = {
  attributes: any;
  element: {
    src?: string;
  };
};

type SegmentData = {
  content?: string;
  text: {
    language: string | null;
    title: string;
  } | null;
};

export const fetchSegmentDetails = async (
  segmentId: string,
): Promise<SegmentData> => {
  return getSegmentById(segmentId);
};

const PechaElement = ({ attributes, element }: PechaElementProps) => {
  const segmentId = element.src;
  const segmentKey = segmentId || "";

  const { data: segmentData, isLoading } = useQuery<SegmentData>(
    ["segment", segmentKey],
    () => fetchSegmentDetails(segmentKey),
    {
      enabled: !!segmentId,
      refetchOnWindowFocus: false,
    },
  );

  if (!segmentId) return null;
  const cleanContent = segmentData?.content
    ? removeFootnotes(segmentData.content)
    : "";

  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className="my-2 rounded border text-left border-dashed border-[#d7d7d7] p-4"
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div
            className={` border-l-2 border-red-900 pl-2 ${getLanguageClass(segmentData?.text?.language ?? "")}`}
          >
            <div
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
            <p className="mt-2.5 text-base font-semibold text-[#A9080E]">
              {segmentData?.text?.title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PechaElement;
