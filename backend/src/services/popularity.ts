import { store } from "../store.ts";

const intervalMs = Number(
  process.env.POPULARITY_REFRESH_INTERVAL_MS ?? 15 * 60 * 1000,
);
const queueThreshold = Number(process.env.POPULARITY_QUEUE_THRESHOLD ?? 100);
const pendingPostIds = new Set<string>();
let timer: NodeJS.Timeout | undefined;
let processing = false;

export function enqueuePostPopularityUpdate(postId: string): void {
  pendingPostIds.add(postId);
  console.log(
    `[popularity] queued post ${postId}; pending=${pendingPostIds.size}`,
  );
  if (pendingPostIds.size >= queueThreshold) void flushPopularityQueue();
}

export async function recordFavoriteChange(
  postId: string,
  delta: 1 | -1,
): Promise<boolean> {
  const updated = await store.incrementPostFavoriteCount(postId, delta);
  if (updated) enqueuePostPopularityUpdate(postId);
  return updated;
}

export async function flushPopularityQueue(): Promise<void> {
  if (processing || pendingPostIds.size === 0) return;
  processing = true;
  const postIds = [...pendingPostIds];
  pendingPostIds.clear();
  console.log(`[popularity] refreshing ${postIds.length} post(s)`);
  try {
    for (const postId of postIds)
      await store.recalculatePopularityScore(postId);
  } finally {
    processing = false;
    if (pendingPostIds.size >= queueThreshold) void flushPopularityQueue();
  }
}

export function startPopularityWorker(): void {
  if (timer) return;
  timer = setInterval(() => void flushPopularityQueue(), intervalMs);
  timer.unref?.();
  console.log(
    `[popularity] worker started; interval=${intervalMs}ms threshold=${queueThreshold}`,
  );
}
