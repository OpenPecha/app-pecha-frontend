import { libraryClient } from "./src/services/library/client.ts";
import {
  getTextVersions,
  getTextCommentaries,
  getSegmentInfo,
  getSegmentTranslations,
  getSegmentCommentaries,
  getSegmentRootText,
  getTextDetails,
} from "./src/services/library/index.ts";
libraryClient.defaults.baseURL = "https://library.webuddhist.com";

const ROOT = "0lvicjSqSLdtXCZQjSYvj";
const TRANSLATION = "FPZ7G5wja03nyj2yHw6gy"; // en translation of the root

const report = async (label: string, textId: string) => {
  console.log(`\n===== ${label} (${textId}) =====`);
  const v = await getTextVersions({ textId, limit: 50 });
  const c = await getTextCommentaries({ textId, limit: 50 });
  console.log(
    `  TEXT PAGE  versions=${v.versions.length} [${v.versions.map((x) => x.language).join(",")}]  commentaries=${c.length}`,
  );

  const d = await getTextDetails(textId, { size: 1, segment_position: 101 });
  const segId = d.content.sections[0].segments[0]?.segment_id;
  if (!segId) return console.log("  (no segments)");
  const info = await getSegmentInfo(segId);
  const si = info.segment_info;
  console.log(
    `  SIDEBAR    translations=${si.translations} commentaries=${si.related_text.commentaries} root_text=${si.related_text.root_text}`,
  );

  const [tr, co, rt] = await Promise.all([
    getSegmentTranslations({ segmentId: segId, limit: 50 }),
    getSegmentCommentaries({ segmentId: segId, limit: 50 }),
    getSegmentRootText({ segmentId: segId, limit: 50 }),
  ]);
  console.log(
    `  ACTUAL     translation groups=${tr.translations.length} [${tr.translations.map((g) => g.language).join(",")}]`,
  );
  console.log(
    `             commentary groups=${co.commentaries.length}  root groups=${rt.root_text.length}`,
  );
};

const run = async () => {
  await report("ROOT", ROOT);
  await report("TRANSLATION (en)", TRANSLATION);
};
run().catch((e) => {
  console.error("FAILED:", e?.message ?? e);
  process.exit(1);
});
