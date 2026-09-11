import { store } from "../mongodb.ts";
import { neo4jRelations } from "../neo4j.ts";
import type { EventQueue, User, UserSummary } from "../types.ts";
import type { EventWorkerStatus } from "./events.ts";

const queue: EventQueue[] = [];
let scheduled = false;
let processing = false;
let processedEventCount = 0;
let lastStartedAt: string | null = null;
let lastCompletedAt: string | null = null;
let lastError: string | null = null;

const status = (): EventWorkerStatus => ({
  processing,
  pendingEvents: queue.length,
  processedEventCount,
  lastStartedAt,
  lastCompletedAt,
  lastError,
});

const sendStatus = () => process.send?.({ type: "status", status: status() });

const userSummary = (user: User): UserSummary => ({
  id: user.id,
  username: user.username,
  profile_name: user.profile_name,
  profile_picture: user.profile_picture?.media_url ?? null,
});

async function handleUserDelete(userId: string) {
  try {
    // 1. Decrement follower/following counters for affected users
    const [followedIds, followerIds] = await Promise.all([
      neo4jRelations.allRelatedUserIds(userId, "following"),
      neo4jRelations.allRelatedUserIds(userId, "followers"),
    ]);

    if (followedIds.length > 0) {
      await store.decrementFollowerCounts(followedIds);
    }
    if (followerIds.length > 0) {
      await store.decrementFollowingCounts(followerIds);
    }

    // 2. Decrement favorite contributions for posts/comments favorited by the deleted user
    const likedPostIds = await neo4jRelations.likedPostIds(userId);
    if (likedPostIds.length > 0) {
      await store.decrementPostFavoriteCounts(likedPostIds);
      for (const postId of likedPostIds) {
        await store.recalculatePopularityScore(postId);
      }
    }

    const commentIds = await store.deleteUserCommentFavorites(userId);
    if (commentIds.length > 0) {
      await store.decrementCommentFavoriteCounts(commentIds);
    }

    // 3. Decrement community populations
    const communityIds = await neo4jRelations.memberCommunityIds(userId);
    if (communityIds.length > 0) {
      await store.decrementCommunityPopulations(communityIds);
    }

    // 4. Detach and delete user node in Neo4j (cleans up FOLLOWS, LIKES, SAVES, PARTICIPATES edges)
    await neo4jRelations.deleteUserNode(userId);
  } catch (error) {
    console.error(`[event-worker] handleUserDelete failed for user ${userId}:`, error);
  }
}

async function handleUserEdit(userId: string) {
  try {
    const user = await store.user(userId);
    if (!user) return; // User already deleted or not found; ignore stale event
    const summary = userSummary(user);
    await store.updateUserSummaryOnPostsAndComments(userId, summary);
  } catch (error) {
    console.error(`[event-worker] handleUserEdit failed for user ${userId}:`, error);
  }
}

async function handlePostDelete(postId: string) {
  try {
    // Delete all comments belonging to the post using a set-based operation
    await store.deleteCommentsByPostId(postId);
  } catch (error) {
    console.error(`[event-worker] handlePostDelete failed for post ${postId}:`, error);
  }
}

async function handleCommentDelete(commentId: string) {
  try {
    // Delete all direct replies belonging to the comment using a set-based operation
    await store.deleteRepliesByCommentId(commentId);
  } catch (error) {
    console.error(`[event-worker] handleCommentDelete failed for comment ${commentId}:`, error);
  }
}

async function handleCommunityDelete(communityId: string) {
  try {
    // Set community_id to null for all affected posts using a set-based update
    await store.nullifyCommunityIdOnPosts(communityId);
  } catch (error) {
    console.error(`[event-worker] handleCommunityDelete failed for community ${communityId}:`, error);
  }
}

async function handleNotificationDelete(notificationId: string) {
  await store.deleteNotification(notificationId);
}

async function routeEvent(event: EventQueue) {
  const { content_type, action, content_id } = event;
  if (content_type === "user" && action === "delete") {
    await handleUserDelete(content_id);
  } else if (content_type === "user" && action === "post") {
    await handleUserEdit(content_id);
  } else if (content_type === "post" && action === "delete") {
    await handlePostDelete(content_id);
  } else if (content_type === "comment" && action === "delete") {
    await handleCommentDelete(content_id);
  } else if (content_type === "community" && action === "delete") {
    await handleCommunityDelete(content_id);
  } else if (content_type === "notification" && action === "delete") {
    await handleNotificationDelete(content_id);
  }
  // Ignore post_favorite / comment_fav or other event types exclusively owned by favorites_worker
}

function schedule() {
  if (scheduled || processing || queue.length === 0) return;
  scheduled = true;
  setImmediate(() => {
    scheduled = false;
    void processNext();
  });
}

async function processNext() {
  if (processing || queue.length === 0) return;
  processing = true;
  const event = queue.shift()!;
  lastStartedAt = new Date().toISOString();
  lastError = null;
  sendStatus();

  try {
    await routeEvent(event);
    processedEventCount += 1;
    lastCompletedAt = new Date().toISOString();
  } catch (error) {
    lastError = error instanceof Error ? error.message : String(error);
    console.error(`[event-worker] unhandled error processing event:`, event, error);
  } finally {
    processing = false;
    sendStatus();
    schedule();
  }
}

process.on("message", (message: { type?: string; event?: EventQueue }) => {
  if (message.type === "event" && message.event) {
    queue.push(message.event);
    sendStatus();
    schedule();
  }
});

sendStatus();
