import { store } from "../mongodb.ts";
import { neo4jRelations, numberValue } from "../neo4j.ts";
import { env } from "../config/env.ts";

type FavoriteTarget = "post" | "comment";
type FavoriteEvent = {
  target: FavoriteTarget;
  targetId: string;
  userId: string;
  favorited: boolean;
};

const intervalMs = env.favoriteEventProcessIntervalMs;
const queueThreshold = env.favoriteEventQueueThreshold;
const heartbeatIntervalMs = 30_000;
const pendingEvents = new Map<string, FavoriteEvent>();
let timer: NodeJS.Timeout | undefined;
let heartbeatTimer: NodeJS.Timeout | undefined;
let processing = false;
let currentBatchSize = 0;
let currentBatchProgress = 0;
let processedEventCount = 0;
let lastStartedAt: string | null = null;
let lastCompletedAt: string | null = null;
let lastError: string | null = null;

export interface AggregationStatus {
  processing: boolean;
  pendingEvents: number;
  currentBatchSize: number;
  currentBatchProgress: number;
  processedEventCount: number;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastError: string | null;
}

export function getAggregationStatus(): AggregationStatus {
  return {
    processing,
    pendingEvents: pendingEvents.size,
    currentBatchSize,
    currentBatchProgress,
    processedEventCount,
    lastStartedAt,
    lastCompletedAt,
    lastError,
  };
}

const eventKey = (event: FavoriteEvent) =>
  `${event.target}:${event.targetId}:${event.userId}`;

export function queueFavoriteEvent(event: FavoriteEvent): void {
  pendingEvents.set(eventKey(event), event);
  console.log(
    `[favorites] queued ${event.target} ${event.targetId} user=${event.userId} favorited=${event.favorited}; pending=${pendingEvents.size}`,
  );
  if (pendingEvents.size >= queueThreshold) void flushFavoriteEvents();
}

async function processCommentEvents(events: FavoriteEvent[]): Promise<void> {
  const deltas = new Map<string, number>();
  for (const event of events) {
    const delta = await store.setCommentFavorite(
      event.targetId,
      event.userId,
      event.favorited,
    );
    if (delta)
      deltas.set(event.targetId, (deltas.get(event.targetId) ?? 0) + delta);
    currentBatchProgress += 1;
  }
  for (const [commentId, delta] of deltas)
    await store.incrementCommentFavoriteCount(commentId, delta);
}

async function processPostEvents(events: FavoriteEvent[]): Promise<void> {
  const deltas = new Map<string, number>();
  for (const event of events) {
    const changed = numberValue(
      await neo4jRelations.likePost(
        event.userId,
        event.targetId,
        event.favorited,
      ),
    );
    if (changed)
      deltas.set(
        event.targetId,
        (deltas.get(event.targetId) ?? 0) + (event.favorited ? 1 : -1),
      );
    currentBatchProgress += 1;
  }
  for (const [postId, delta] of deltas) {
    await store.incrementPostFavoriteCount(postId, delta);
    await store.recalculatePopularityScore(postId);
  }
}

export async function flushFavoriteEvents(): Promise<void> {
  if (processing || pendingEvents.size === 0) return;
  processing = true;
  const snapshot = new Map(pendingEvents);
  pendingEvents.clear();
  currentBatchSize = snapshot.size;
  currentBatchProgress = 0;
  lastStartedAt = new Date().toISOString();
  lastError = null;
  console.log(`[favorites] processing ${snapshot.size} event(s)`);
  try {
    const events = [...snapshot.values()];
    await processCommentEvents(events.filter((event) => event.target === "comment"));
    await processPostEvents(events.filter((event) => event.target === "post"));
    processedEventCount += snapshot.size;
    lastCompletedAt = new Date().toISOString();
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    for (const [key, event] of snapshot)
      if (!pendingEvents.has(key)) pendingEvents.set(key, event);
    console.log("[favorites] processing failed; events requeued", error);
  } finally {
    processing = false;
    currentBatchSize = 0;
    currentBatchProgress = 0;
    if (pendingEvents.size >= queueThreshold) void flushFavoriteEvents();
  }
}

export function startAggregationWorker(): void {
  if (timer) return;
  timer = setInterval(() => void flushFavoriteEvents(), intervalMs);
  timer.unref?.();
  heartbeatTimer = setInterval(() => {
    console.log("[aggregation] status", getAggregationStatus());
  }, heartbeatIntervalMs);
  heartbeatTimer.unref?.();
  console.log(
    `[aggregation] worker started; interval=${intervalMs}ms threshold=${queueThreshold}`,
  );
}
