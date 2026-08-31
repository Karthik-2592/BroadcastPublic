import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const filePath = process.argv[2];
if (!filePath) throw new Error("Usage: npm run media:test -- <path-to-image>");
const file = await readFile(filePath);
const form = new FormData();
form.append("media", new Blob([file], { type: "image/png" }), basename(filePath));
const response = await fetch("http://localhost:3000/media/profile/test-document", { method: "POST", body: form });
console.log(await response.text());

