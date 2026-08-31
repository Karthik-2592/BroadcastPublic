import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import multer from "multer";

const BUCKET_ROOT = process.env.MEDIA_BUCKET_PATH ?? "B:\\Databases\\MediaBucket";
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const mediaCategories = {
  community: "CommunityBanners",
  profile: "ProfilePictures",
  post: "PostMedia",
} as const;

export type MediaCategory = keyof typeof mediaCategories;

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 3 },
  fileFilter: (_req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  },
});

export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
}

export async function saveMedia(
  file: UploadedFile,
  documentId: string,
  category: MediaCategory,
  count: number,
  timestamp = Date.now(),
) {
  const directory = join(BUCKET_ROOT, mediaCategories[category]);
  await mkdir(directory, { recursive: true });
  const extension = file.mimetype.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const filename = `${documentId}_${timestamp}_${count}.${extension}`;
  await writeFile(join(directory, filename), file.buffer);
  return { filename, category: mediaCategories[category], path: join(mediaCategories[category], filename) };
}
