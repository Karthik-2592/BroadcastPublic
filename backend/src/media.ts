import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import multer from "multer";
import { env } from "./config/env.ts";
import type { Request } from "express";

export const BUCKET_ROOT = env.bucketStorageURL;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export const mediaCategories = {
  community: "CommunityBanners",
  profile: "ProfilePictures",
  post: "PostMedia",
} as const;

export const mediaUrl = (req: Request, path: string) =>
  `${req.protocol}://${req.get("host")}/media/files/${path}`;

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
  const path = `${mediaCategories[category]}/${filename}`;
  return { filename, category: mediaCategories[category], path, media_id: (timestamp % 2147483000) + count, mime_type: file.mimetype };
}
