import multer from "multer";
import { env } from "./config/env.ts";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

export const mediaCategories = {
  community: "CommunityBanners",
  profile: "ProfilePictures",
  post: "PostMedia",
} as const;

export const mediaUrl = (path: string, version = Date.now()) =>
  `${env.mediaServerURL.replace(/\/$/, "")}/objects/${path}?v=${version}`;

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
  method: "POST" | "PUT" = "POST",
) {
  const extension = file.mimetype.split("/")[1]?.replace("jpeg", "jpg") ?? "bin";
  const filename = `${documentId}.${count}.${extension}`;
  const path = `${mediaCategories[category]}/${filename}`;
  const requestBody = new Uint8Array(file.buffer.byteLength)
  requestBody.set(file.buffer)
  const response = await fetch(mediaUrl(path), {
    method,
    headers: { "Content-Type": file.mimetype },
    body: requestBody,
  });
  if (!response.ok) throw new Error(`Media server rejected ${method} ${path}: ${response.status}`);
  return { filename, category: mediaCategories[category], path, media_id: count, mime_type: file.mimetype };
}
