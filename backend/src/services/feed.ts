import { decodeLegacyCursor, END_CURSOR, encodeLegacyCursor, type LegacyCursorPayload } from "../cursor.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations } from "../neo4j.ts";

const FEED_BUFFER_CAPACITY = 50;
const FEED_RESPONSE_SIZE = 10;
const USER_RECOMMENDATION_SIZE = 4;
const COMMUNITY_RECOMMENDATION_SIZE = 8;
const FEED_TTL_MS = 60 * 60 * 1000; // 1 hour

const FEED_REASON = {
  chronological: 0,
  followedUserLiked: 1,
  joinedCommunity: 2,
} as const;

type FeedReasonCode = (typeof FEED_REASON)[keyof typeof FEED_REASON];

const FEED_REASON_TEXT: Record<Exclude<FeedReasonCode, 0>, string> = {
  [FEED_REASON.followedUserLiked]: "Liked by someone you follow",
  [FEED_REASON.joinedCommunity]: "From a community you joined",
};

type SessionFeed = {
  postIds: string[];
  postReasonCodes: Record<string, FeedReasonCode>;
  userRecommendationIds: string[];
  communityRecommendationIds: string[];
  createdAt: number;
  expiresAt: number;
};

const feeds = new Map<string, SessionFeed>();
const initializing = new Map<string, Promise<SessionFeed>>();

async function generateFeedRecommendations(userId: string) {
  const [neo4jData, chronological] = await Promise.all([
    neo4jRelations.feedRecommendationsGrouped(userId, {
      postLimit: FEED_BUFFER_CAPACITY,
      userLimit: USER_RECOMMENDATION_SIZE,
      communityLimit: COMMUNITY_RECOMMENDATION_SIZE,
    }),
    store.feedIds(FEED_BUFFER_CAPACITY),
  ]);

  const postReasonCodes: Record<string, FeedReasonCode> = {};
  for (const postId of neo4jData.posts[0]) {
    postReasonCodes[postId] = FEED_REASON.followedUserLiked;
  }
  for (const postId of neo4jData.posts[1]) {
    postReasonCodes[postId] ??= FEED_REASON.joinedCommunity;
  }

  const recommendedPosts = [...new Set([...neo4jData.posts[0], ...neo4jData.posts[1]])];
  const postIds = [...new Set([...recommendedPosts, ...chronological])].slice(0, FEED_BUFFER_CAPACITY);
  const userRecommendationIds = [...new Set(neo4jData.users.flat())].slice(0, USER_RECOMMENDATION_SIZE);
  const communityRecommendationIds = [...new Set(neo4jData.communities.flat())].slice(0, COMMUNITY_RECOMMENDATION_SIZE);

  return { postIds, postReasonCodes, userRecommendationIds, communityRecommendationIds };
}

async function initialize(userId: string) {
  const existing = feeds.get(userId);
  if (existing) {
    if (Date.now() < existing.expiresAt) {
      return existing;
    }
    feeds.delete(userId);
  }
  const pending = initializing.get(userId);
  if (pending) return pending;
  const creation = generateFeedRecommendations(userId)
    .then(({ postIds, postReasonCodes, userRecommendationIds, communityRecommendationIds }) => {
      const now = Date.now();
      const state: SessionFeed = {
        postIds,
        postReasonCodes,
        userRecommendationIds,
        communityRecommendationIds,
        createdAt: now,
        expiresAt: now + FEED_TTL_MS,
      };
      feeds.set(userId, state);
      initializing.delete(userId);
      return state;
    });
  initializing.set(userId, creation);
  return creation;
}

export class FeedService {
  initializeSession(userId: string) {
    return initialize(userId);
  }
  async getFeed(userId: string, cursor?: string, limit = FEED_RESPONSE_SIZE) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > FEED_RESPONSE_SIZE) throw new Error("Malformed request.");
    const state = await initialize(userId);
    const page = decodeLegacyCursor(cursor, { feed: userId });
    const ids = state.postIds.slice(page.offset, page.offset + limit);
    const posts = await store.postsByIds(ids);
    const byId = new Map(posts.map((post) => [post.id, post]));
    const available = ids.flatMap((id) => {
      const post = byId.get(id);
      if (!post) return [];
      const reasonCode = state.postReasonCodes[id];
      const recommendationReason = reasonCode && FEED_REASON_TEXT[reasonCode];
      return [recommendationReason ? { ...post, recommendationReason } : post];
    });
    const next = page.offset + limit < state.postIds.length
      ? encodeLegacyCursor({ offset: page.offset + limit, filters: { feed: userId } } as LegacyCursorPayload)
      : END_CURSOR;
    return { posts: available, cursor: next };
  }

  async refresh(userId: string) {
    feeds.delete(userId);
    return initialize(userId);
  }

  destroy(userId: string) {
    initializing.delete(userId);
    feeds.delete(userId);
  }
}

export const feedService = new FeedService();
