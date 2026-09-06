export const END_CURSOR = "null";

export interface CursorPayload {
  values?: Record<string, string | number>;
  offset?: number;
  filters: Record<string, string>;
  direction?: "asc" | "desc";
}

export interface LegacyCursorPayload {
  offset: number;
  filters: Record<string, string>;
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function encodeLegacyCursor(payload: LegacyCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function validateCursorSize(value: string): void {
  if (value.length > 512) {
    throw new Error("Cursor exceeds maximum size.");
  }
}

function validateFilterMatch(
  cursorFilters: Record<string, string>,
  expectedFilters: Record<string, string>,
): void {
  for (const [key, value] of Object.entries(expectedFilters)) {
    if (cursorFilters[key] !== value) {
      throw new Error("Cursor filter mismatch.");
    }
  }
}

function validateSortFields(
  values: Record<string, string | number>,
  requiredFields: string[],
): void {
  for (const field of requiredFields) {
    if (!(field in values)) {
      throw new Error("Cursor missing required sort field.");
    }
  }
}

export function decodeCursor(
  value: unknown,
  filters: Record<string, string> = {},
  requiredFields: string[] = [],
): CursorPayload {
  if (value === undefined || value === null || value === "" || value === END_CURSOR) {
    return { values: {}, filters, direction: "desc" };
  }
  if (typeof value !== "string") {
    throw new Error("Malformed cursor.");
  }
  validateCursorSize(value);
  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as Partial<CursorPayload>;
    
    // Check if it's a legacy cursor (has offset but no values)
    if (payload.offset !== undefined && !payload.values) {
      return decodeLegacyCursor(value, filters) as CursorPayload;
    }
    
    // New cursor format
    if (!payload.values || typeof payload.values !== "object") {
      throw new Error("Invalid cursor structure.");
    }
    if (!payload.filters || typeof payload.filters !== "object") {
      throw new Error("Invalid cursor structure.");
    }
    if (
      payload.direction !== "asc" &&
      payload.direction !== "desc"
    ) {
      throw new Error("Invalid cursor structure.");
    }
    validateFilterMatch(payload.filters, filters);
    validateSortFields(payload.values, requiredFields);
    return {
      values: payload.values,
      filters: payload.filters,
      direction: payload.direction,
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Cursor")) {
      throw error;
    }
    throw new Error("Malformed cursor.");
  }
}

export function decodeLegacyCursor(
  value: unknown,
  filters: Record<string, string> = {},
): LegacyCursorPayload {
  if (value === undefined || value === null || value === "" || value === END_CURSOR) {
    return { offset: 0, filters };
  }
  if (typeof value !== "string" || value.length > 512) {
    throw new Error("Malformed cursor.");
  }
  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<LegacyCursorPayload>;
    const offset = payload.offset;
    if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0 || !payload.filters || typeof payload.filters !== "object") {
      throw new Error("Invalid cursor.");
    }
    for (const [key, value] of Object.entries(filters))
      if (payload.filters[key] !== value) throw new Error("Invalid cursor.");
    return { offset, filters: payload.filters as Record<string, string> };
  } catch {
    throw new Error("Malformed cursor.");
  }
}

export function createNextCursor(
  lastItem: Record<string, unknown> | null,
  sortField: string,
  filters: Record<string, string>,
  direction: "asc" | "desc" = "desc",
): string {
  if (!lastItem) {
    return END_CURSOR;
  }
  const value = lastItem[sortField];
  if (value === undefined || value === null) {
    return END_CURSOR;
  }
  let serializedValue: string | number;
  if (value instanceof Date) {
    serializedValue = value.toISOString();
  } else if (typeof value === "number") {
    serializedValue = value;
  } else if (typeof value === "string") {
    // Handle ISO date strings from safe functions
    serializedValue = value;
  } else {
    // Handle other types like MongoDB Double or objects with valueOf
    try {
      serializedValue = Number(value);
    } catch {
      serializedValue = String(value);
    }
  }
  return encodeCursor({
    values: { [sortField]: serializedValue },
    filters,
    direction,
  });
}
