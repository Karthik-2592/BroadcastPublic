import { store } from "../mongodb.ts";
import { neo4jRelations, numberValue } from "../neo4j.ts";
import type { AggregationStatus, FavoriteEvent } from "./favorites.ts";

const queue = new Map<string, FavoriteEvent>();
let scheduled = false; let processing = false; let currentBatchSize = 0; let currentBatchProgress = 0; let processedEventCount = 0;
let lastStartedAt: string | null = null; let lastCompletedAt: string | null = null; let lastError: string | null = null;
const status = (): AggregationStatus => ({ processing, pendingEvents: queue.size, currentBatchSize, currentBatchProgress, processedEventCount, lastStartedAt, lastCompletedAt, lastError });
const sendStatus = () => process.send?.({ type: "status", status: status() });
const eventKey = (event: FavoriteEvent) => `${event.target}:${event.targetId}:${event.userId}`;

function schedule() { if (scheduled || processing || queue.size === 0) return; scheduled = true; setImmediate(() => { scheduled = false; void flush(); }); }

async function flush() {
  if (processing || queue.size === 0) return;
  processing = true; const snapshot = new Map(queue); queue.clear(); currentBatchSize = snapshot.size; currentBatchProgress = 0; lastStartedAt = new Date().toISOString(); lastError = null; sendStatus();
  try {
    const commentDeltas = new Map<string, number>(); const postDeltas = new Map<string, number>();
    for (const event of snapshot.values()) {
      if (event.target === "comment") { const delta = await store.setCommentFavorite(event.targetId, event.userId, event.favorited); if (delta) commentDeltas.set(event.targetId, (commentDeltas.get(event.targetId) ?? 0) + delta); }
      else { const changed = numberValue(await neo4jRelations.likePost(event.userId, event.targetId, event.favorited)); if (changed) postDeltas.set(event.targetId, (postDeltas.get(event.targetId) ?? 0) + (event.favorited ? 1 : -1)); }
      currentBatchProgress += 1; sendStatus();
    }
    for (const [id, delta] of commentDeltas) await store.incrementCommentFavoriteCount(id, delta);
    for (const [id, delta] of postDeltas) { await store.incrementPostFavoriteCount(id, delta); await store.recalculatePopularityScore(id); }
    processedEventCount += snapshot.size; lastCompletedAt = new Date().toISOString();
  } catch (error) { lastError = error instanceof Error ? error.message : String(error); for (const [key, event] of snapshot) if (!queue.has(key)) queue.set(key, event); }
  finally { processing = false; currentBatchSize = 0; currentBatchProgress = 0; sendStatus(); schedule(); }
}

process.on("message", (message: { type?: string; event?: FavoriteEvent }) => { if (message.type === "favorite" && message.event) { queue.set(eventKey(message.event), message.event); sendStatus(); schedule(); } else if (message.type === "flush") void flush(); });
sendStatus();
