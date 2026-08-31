import { decodeCursor, END_CURSOR, encodeCursor } from "../cursor.ts";
import { store } from "../mongodb.ts";
import { neo4jRelations } from "../neo4j.ts";

const FEED_BUFFER_CAPACITY = 50;
const FEED_RESPONSE_SIZE = 10;
const USER_RECOMMENDATION_SIZE = 4;
const COMMUNITY_RECOMMENDATION_SIZE = 8;

type SessionFeed = {
  postIds: string[];
  userRecommendationIds: string[];
  communityRecommendationIds: string[];
};

const feeds = new Map<string, SessionFeed>();
const initializing = new Map<string, Promise<SessionFeed>>();

async function generateFeed(userId: string) {
  const [followedLikes, joinedCommunities, chronological] = await Promise.all([
    neo4jRelations.postRecommendationsByFollowedLikes(userId, FEED_BUFFER_CAPACITY),
    neo4jRelations.postRecommendationsByJoinedCommunities(userId, FEED_BUFFER_CAPACITY),
    store.feedIds(FEED_BUFFER_CAPACITY),
  ]);
  const ranked = new Map<string, number>();
  for (const item of [...followedLikes, ...joinedCommunities]) ranked.set(item.id, (ranked.get(item.id) ?? 0) + item.score);
  const recommended = [...ranked.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  return [...new Set([...recommended, ...chronological])].slice(0, FEED_BUFFER_CAPACITY);
}

async function generateUserRecommendations(userId: string) {
  const groups = await Promise.all([
    neo4jRelations.userRecommendationsByInterests(userId, USER_RECOMMENDATION_SIZE),
    neo4jRelations.userRecommendationsByCommunities(userId, USER_RECOMMENDATION_SIZE),
    neo4jRelations.userRecommendationsByFollowNetwork(userId, USER_RECOMMENDATION_SIZE),
  ]);
  return [...new Map(groups.flat().map((item) => [item.id, item.score])).entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, USER_RECOMMENDATION_SIZE).map(([id]) => id);
}

async function generateCommunityRecommendations(userId: string) {
  const groups = await Promise.all([
    neo4jRelations.communityRecommendationsByInterests(userId, COMMUNITY_RECOMMENDATION_SIZE),
    neo4jRelations.communityRecommendationsByFollowNetwork(userId, COMMUNITY_RECOMMENDATION_SIZE),
    neo4jRelations.communityRecommendationsByLikedPosts(userId, COMMUNITY_RECOMMENDATION_SIZE),
  ]);
  return [...new Map(groups.flat().map((item) => [item.id, item.score])).entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, COMMUNITY_RECOMMENDATION_SIZE).map(([id]) => id);
}

async function initialize(userId: string) {
  const existing = feeds.get(userId);
  if (existing) return existing;
  const pending = initializing.get(userId);
  if (pending) return pending;
  const creation = Promise.all([generateFeed(userId), generateUserRecommendations(userId), generateCommunityRecommendations(userId)])
    .then(([postIds, userRecommendationIds, communityRecommendationIds]) => {
      const state = { postIds, userRecommendationIds, communityRecommendationIds };
      feeds.set(userId, state);
      initializing.delete(userId);
      return state;
    });
  initializing.set(userId, creation);
  return creation;
}

export class FeedService {
  async getFeed(userId: string, cursor?: string, limit = FEED_RESPONSE_SIZE) {
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > FEED_RESPONSE_SIZE) throw new Error("Malformed request.");
    const state = await initialize(userId);
    const page = decodeCursor(cursor, { feed: userId });
    const ids = state.postIds.slice(page.offset, page.offset + limit);
    const posts = await store.postsByIds(ids);
    const byId = new Map(posts.map((post) => [post.id, post]));
    const available = ids.flatMap((id) => byId.has(id) ? [byId.get(id)!] : []);
    const next = page.offset + limit < state.postIds.length
      ? encodeCursor({ offset: page.offset + limit, filters: { feed: userId } })
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
