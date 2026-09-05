import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { env } from "../src/config/env.ts";

const contentTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};
const root = resolve(env.bucketStorageURL);

const server = createServer(async (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");

  if (request.method === "OPTIONS") {
    response.writeHead(204, { "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS" });
    response.end();
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD" && request.method !== "POST" && request.method !== "PUT") {
    response.writeHead(405, { Allow: "GET, HEAD, POST, PUT, OPTIONS" });
    response.end();
    return;
  }

  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  if (!pathname.startsWith("/objects/")) {
    response.writeHead(404);
    response.end("Object route not found.");
    return;
  }
  const objectPath = pathname.slice("/objects/".length);
  const filePath = resolve(root, objectPath);
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    response.writeHead(400);
    response.end("Invalid media path.");
    return;
  }

  if (request.method === "POST" || request.method === "PUT") {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    if (!chunks.length) {
      response.writeHead(400);
      response.end("Media body is required.");
      return;
    }
    await mkdir(resolve(root, join(objectPath, "..")), { recursive: true });
    await writeFile(filePath, Buffer.concat(chunks));
    response.writeHead(request.method === "POST" ? 201 : 200, {
      "Content-Type": "application/json",
      Location: `${env.mediaServerURL.replace(/\/$/, "")}/objects/${objectPath}`,
    });
    response.end(JSON.stringify({ path: objectPath }));
    return;
  }

  try {
    const details = await stat(filePath);
    if (!details.isFile()) throw new Error("Not a file");
    response.writeHead(200, {
      "Content-Length": details.size,
      "Content-Type": contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store, max-age=0",
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end("Media not found.");
  }
});

server.listen(env.mediaServerPort, () => {
  console.log(`Media server listening on ${env.mediaServerURL}`);
});