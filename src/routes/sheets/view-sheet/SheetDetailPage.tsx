import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import YouTube from "react-youtube";
import { FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { PanelProvider } from "../../../context/PanelContext.tsx";
import { extractSpotifyInfo } from "../sheet-utils/Constant.ts";
import axiosInstance from "../../../config/axios-config.ts";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useTranslate } from "@tolgee/react";
import { getLanguageClass } from "../../../utils/helperFunctions.tsx";
import SheetShare from "../local-components/sheet-share/sheetShare.tsx";
import { fetchSegmentDetails } from "../local-components/Editors/Elements/pecha-element/PechaElement.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog.tsx";

type SheetPublisher = {
  name: string;
  username: string;
  email: string;
  avatar_url?: string;
};
type SegmentDataProps = {
  content?: string;
  text?: {
    language: string | null;
    title: string;
    text_id?: string;
  } | null;
  text_id?: string;
};
type SheetSegment = {
  segment_id: string;
  type: "source" | "content" | "image" | "video" | "audio";
  content: string;
  language?: string;
  key?: string;
  text_title?: string;
  [key: string]: unknown;
};

type SheetData = {
  sheet_title: string;
  publisher: SheetPublisher;
  is_published: boolean;
  views?: number;
  content: {
    segments: SheetSegment[];
  };
  [key: string]: unknown;
};

type UserInfo = {
  email?: string;
};

type SheetDetailPageProps = {
  addChapter?: (
    params: { textId: string; segmentId: string },
    currentChapter?: unknown,
    shouldOpen?: boolean,
  ) => void;
  currentChapter?: unknown;
};

export const getUserInfo = async (): Promise<UserInfo> => {
  const { data } = await axiosInstance.get(`/api/v1/users/info`, {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
    },
  });
  return data;
};
export const fetchSheetData = async (id: string): Promise<SheetData> => {
  const { data } = await axiosInstance.get(`/api/v1/sheets/${id}`, {
    params: {
      skip: 0,
      limit: 10,
    },
  });
  return data;
};

export const deleteSheet = async (id: string): Promise<boolean> => {
  await axiosInstance.delete(`/api/v1/sheets/${id}`);
  return true;
};

export const updateSheetVisibility = async (
  sheetId: string,
  isPublished: boolean,
  sheetData: SheetData,
): Promise<boolean> => {
  const source = sheetData.content.segments.map((segment, index) => {
    if (["image", "audio", "video"].includes(segment.type)) {
      return {
        position: index,
        type: segment.type,
        content: segment.key || segment.content,
      };
    }
    if (segment.type === "source") {
      return {
        position: index,
        type: "source",
        content: segment.segment_id,
      };
    }
    return {
      position: index,
      type: "content",
      content: segment.key || segment.content,
    };
  });

  await axiosInstance.put(`/api/v1/sheets/${sheetId}`, {
    title: sheetData.sheet_title,
    source: source,
    is_published: isPublished,
  });
  return true;
};

const getAudioSrc = (url: string): string | null => {
  const spotify = extractSpotifyInfo(url);
  if (spotify) {
    return `https://open.spotify.com/embed/${spotify.type}/${spotify.id}?utm_source=generator`;
  }
  if (url.includes("soundcloud.com")) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500`;
  }
  return null;
};

const SheetDetailPage = ({
  addChapter,
  currentChapter,
}: SheetDetailPageProps) => {
  const { sheetSlugAndId } = useParams<{ sheetSlugAndId?: string }>();
  const { t } = useTranslate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: userInfo } = useQuery<UserInfo>({
    queryKey: ["userInfo"],
    queryFn: getUserInfo,
    enabled: !!sessionStorage.getItem("accessToken"),
  });
  const sheetId = sheetSlugAndId?.split("_").pop() || "";

  const { data: sheetData, isLoading } = useQuery<SheetData>({
    queryKey: ["sheetData", sheetId],
    queryFn: () => fetchSheetData(sheetId),
    enabled: !!sheetId,
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { mutate: deleteSheetMutation, isLoading: isDeleting } =
    useMutation<boolean>({
      mutationFn: () => deleteSheet(sheetId),
      onSuccess: () => {
        setIsDeleteDialogOpen(false);
        navigate("/note");
      },
      onError: (error) => {
        console.error("Error deleting sheet:", error);
      },
    });

  const { mutate: updateVisibilityMutation } = useMutation<
    boolean,
    unknown,
    boolean
  >({
    mutationFn: (isPublished) => {
      if (!sheetData) {
        return Promise.resolve(false);
      }
      return updateSheetVisibility(sheetId, isPublished, sheetData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sheetData", sheetId] });
    },
    onError: (error) => {
      console.error("Error updating visibility:", error);
    },
  });

  const handleVisibilityToggle = () => {
    const newVisibility = !sheetData?.is_published;
    updateVisibilityMutation(newVisibility);
  };

  const renderSegment = (segment: SheetSegment) => {
    switch (segment.type) {
      case "source":
        return (
          <button
            key={segment.segment_id}
            className="flex w-full cursor-pointer text-left"
            onClick={async () => {
              if (!addChapter) {
                return;
              }
              const segmentData: SegmentDataProps = await fetchSegmentDetails(
                segment.segment_id,
              );
              const textId = segmentData?.text?.text_id || segmentData?.text_id;
              if (!textId) {
                return;
              }
              addChapter(
                {
                  textId,
                  segmentId: segment.segment_id,
                },
                currentChapter,
                true,
              );
            }}
            type="button"
          >
            <div className="w-full flex rounded border border-dashed border-gray-300 p-6 transition-shadow hover:shadow-sm">
              <div
                className={`${getLanguageClass(segment.language || "en")} text-lg border-l-2 border-red-900 px-2 text-left`}
              >
                <p
                  className="whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: segment.content }}
                />
                <p className="text-sm mt-2 font-semibold text-[#A9080E]">
                  {segment.text_title}
                </p>
              </div>
            </div>
          </button>
        );
      case "content":
        return (
          <div className="w-full" key={`${segment.segment_id}`}>
            <p
              className="bg-white text-gray-800"
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
          </div>
        );
      case "image":
        return (
          <div
            className="flex items-center justify-center"
            key={segment.segment_id}
          >
            <figure className="m-0 w-full">
              <img
                src={segment.content}
                alt="Sheet content"
                className="h-auto w-full max-h-[600px] rounded object-cover"
              />
            </figure>
          </div>
        );
      case "video":
        return (
          <div
            className="flex w-full items-center justify-center"
            key={segment.segment_id}
          >
            <div className="w-full max-w-4xl overflow-hidden rounded shadow-sm">
              <YouTube videoId={segment.content} className="h-full w-full" />
            </div>
          </div>
        );
      case "audio": {
        const audioSrc = getAudioSrc(segment.content);
        if (!audioSrc) {
          return null;
        }
        return (
          <div className="w-full" key={segment.segment_id}>
            <iframe
              src={audioSrc}
              className="h-[166px] w-full"
              title={`audio-${segment.segment_id}`}
            />
          </div>
        );
      }
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <p className=" h-screen w-full flex items-center justify-center text-center text-gray-700">
        {t("common.loading")}
      </p>
    );
  }

  if (!sheetData || sheetData.content.segments.length === 0) {
    return (
      <p className=" h-screen w-full flex items-center justify-center text-center text-gray-700">
        {t("text_category.message.notfound")}
      </p>
    );
  }

  const renderViewToolbar = () => {
    return (
      <div className="flex items-center justify-between border-y border-gray-300 py-3 text-gray-700">
        <div className="flex items-center gap-2 text-sm">
          {/* <FiEye className="cursor-pointer opacity-70 transition-opacity duration-200 hover:opacity-100" />
          <p className="m-0">{sheetData.views || 0}</p> */}
        </div>
        <div className="flex items-center space-x-4">
          {sheetData.publisher.email === userInfo?.email && (
            <>
              <Button
                variant={sheetData.is_published ? "default" : "outline"}
                className={
                  sheetData.is_published
                    ? "bg-[#DCFCE7] text-green-500 hover:bg-[#DCFCE7]/80 font-bold"
                    : "bg-white text-gray-500 hover:bg-gray-100 font-bold"
                }
                onClick={handleVisibilityToggle}
              >
                {sheetData.is_published ? "Public" : "Private"}
              </Button>
              <FiEdit
                size={20}
                className="cursor-pointer opacity-70 transition-opacity duration-200 hover:opacity-60"
                onClick={() => {
                  navigate(`/sheets/${sheetId}`);
                }}
              />
              <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="group rounded p-1 text-gray-500 transition hover:bg-gray-100"
                  >
                    <FiTrash className="h-5 w-5 opacity-70 transition-opacity duration-200 group-hover:opacity-100" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("sheet.delete_header")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("sheet.delete_warning_message")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>
                      {t("sheet.delete_cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteSheetMutation()}
                      disabled={isDeleting}
                      className="bg-red-800 text-white hover:bg-red-800/80 font-bold"
                    >
                      {isDeleting
                        ? t("sheet.deleting.message")
                        : t("sheet.delete_button")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <SheetShare />
        </div>
      </div>
    );
  };
  const renderUserInfo = () => {
    const { name, username, avatar_url } = sheetData.publisher;
    return (
      <Link
        to={`/user/${encodeURIComponent(username)}`}
        className="mb-3 flex items-center gap-2.5 text-black no-underline"
      >
        {avatar_url ? (
          <img
            src={avatar_url}
            alt="user"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
            {sheetData.publisher.name
              .split(" ")
              .map((name: string) => name[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div className="text-left leading-tight">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-gray-600">@{username}</p>
        </div>
      </Link>
    );
  };
  const renderSheetContent = () => {
    return (
      <div>
        <section>
          <div className="flex flex-col gap-2">
            {sheetData.content.segments.map((segment: SheetSegment) =>
              renderSegment(segment),
            )}
          </div>
        </section>
      </div>
    );
  };
  return (
    <div className="flex w-full h-screen overflow-y-auto">
      <main className={`flex-1 p-8`}>
        <article className="mx-auto max-w-3xl space-y-4">
          <h1 className=" text-2xl font-semibold text-gray-700">
            {sheetData.sheet_title}
          </h1>
          {renderUserInfo()}
          {renderViewToolbar()}
          {renderSheetContent()}
        </article>
      </main>
    </div>
  );
};

const SheetDetailPageWithPanelContext = ({
  addChapter,
  currentChapter,
}: SheetDetailPageProps) => (
  <PanelProvider>
    <SheetDetailPage addChapter={addChapter} currentChapter={currentChapter} />
  </PanelProvider>
);

export default SheetDetailPageWithPanelContext;
