export const END_CURSOR = "null";

export interface CursorPayload {
  offset: number;
  filters: Record<string, string>;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodeCursor(value: unknown, filters: Record<string, string> = {}): CursorPayload {
  if (value === undefined || value === null || value === "" || value === END_CURSOR)
    return { offset: 0, filters };
  if (typeof value !== "string" || value.length > 512)
    throw new Error("Malformed cursor.");
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<CursorPayload>;
    const offset = payload.offset;
    if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0 || !payload.filters || typeof payload.filters !== "object")
      throw new Error("Invalid cursor.");
    for (const [key, value] of Object.entries(filters))
      if (payload.filters[key] !== value) throw new Error("Invalid cursor.");
    return { offset, filters: payload.filters as Record<string, string> };
  } catch {
    throw new Error("Malformed cursor.");
  }
}

export function nextCursor(offset: number, itemCount: number, limit: number, filters: Record<string, string>) {
  return itemCount <= limit ? END_CURSOR : encodeCursor({ offset: offset + limit, filters });
}
