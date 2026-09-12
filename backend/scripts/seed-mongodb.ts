import { createHash, randomBytes } from "node:crypto";
import { Double, MongoClient, ObjectId } from "mongodb";
import { env } from "../src/config/env.ts";


const uri = env.mongoUri;
const databaseName = env.mongoDatabase;
const timeout = env.mongoServerSelectionTimeoutMs;
const userCount = env.sampleUserCount;
const communityCount = env.sampleCommunityCount;
const postCount = env.samplePostCount;
const commentCount = env.sampleCommentCount;
const notificationCount = env.sampleNotificationCount;
const commentFavoriteCount = env.sampleCommentFavoriteCount;

const adjectives = [
  "brave",
  "calm",
  "clever",
  "eager",
  "kind",
  "lively",
  "merry",
  "rapid",
  "quiet",
  "swift",
];
const nouns = [
  "badger",
  "falcon",
  "fox",
  "otter",
  "panda",
  "raven",
  "sparrow",
  "tiger",
  "wolf",
  "yak",
];
const interests = [
  "Art",
  "Business & Finance",
  "Fashion & Beauty",
  "Travelling",
  "Sports",
  "Food",
  "Technology",
  "Books",
  "Health",
  "Games",
  "Films & TV",
  "Nature",
  "News & Politics",
  "Science",
  "Pop Culture",
  "Lifestyle",
];
const tags = [
  "discussion",
  "ideas",
  "tips",
  "news",
  "question",
  "discovery",
  "community",
  "learning",
];
const passwordCharacters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function randomChoice<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)];
}

function randomPassword() {
  const length = 8 + Math.floor(Math.random() * 5);
  return Array.from({ length }, () => randomChoice([...passwordCharacters])).join(
    "",
  );
}

function passwordDocument(password: string) {
  const salt = randomBytes(16).toString("hex");
  return {
    password_hash: createHash("sha256")
      .update(`${salt}:${password}`)
      .digest("hex"),
    salt,
  };
}

function randomUsername() {
  return `${randomChoice(adjectives)}${randomChoice(nouns)}${Math.floor(
    1000 + Math.random() * 9000,
  )}`;
}

function randomPhrase(length: number) {
  return Array.from({ length }, () => randomChoice(nouns)).join(" ");
}

function randomSubset<T>(values: T[], min: number, max: number) {
  const shuffled = [...values].sort(() => Math.random() - 0.5);
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffled.slice(0, Math.min(count, values.length));
}

function randomDate(daysBack = 30) {
  return new Date(Date.now() - Math.floor(Math.random() * daysBack * 24 * 60 * 60 * 1000));
}

function userSummary(user: { _id: ObjectId; username: string; profile_name: string }) {
  return {
    id: user._id.toHexString(),
    username: user.username,
    profile_name: user.profile_name,
    profile_picture: null,
  };
}

function unique<T>(factory: () => T, key: (value: T) => string, count: number) {
  const values: T[] = [];
  const keys = new Set<string>();
  while (values.length < count) {
    const value = factory();
    const valueKey = key(value);
    if (!keys.has(valueKey)) {
      keys.add(valueKey);
      values.push(value);
    }
  }
  return values;
}

async function seed() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeout });
  try {
    await client.connect();
    const database = client.db(databaseName);
    const usersCollection = database.collection("users");
    const passwordsCollection = database.collection("passwords");
    const communitiesCollection = database.collection("communities");
    const postsCollection = database.collection("posts");
    const commentsCollection = database.collection("comments");
    const notificationsCollection = database.collection("notifications");
    const commentFavoriteStoreCollection = database.collection("comment_favorite_store");

    const recoveryPasswords = new Map<string, string>();
    const users = unique(
      () => {
        const username = randomUsername();
        const password = randomPassword();
        recoveryPasswords.set(username, password);
        return {
          _id: new ObjectId(),
          username,
          email: `${username}@example.com`,
          password: passwordDocument(password),
          interests: randomSubset(interests, 1, 4),
          profile_name: `${randomChoice(adjectives)} ${randomChoice(nouns)}`,
          profile_picture: null,
          profile_description: `Interested in ${randomChoice(interests).toLowerCase()} and ${randomChoice(interests).toLowerCase()}.`,
          follower_count: 0,
          following_count: 0,
        };
      },
      (user) => user.username,
      userCount,
    );
    await usersCollection.insertMany(users);
    await passwordsCollection.insertMany(
      users.map((user) => ({
        username: user.username,
        password: recoveryPasswords.get(user.username)!,
      })),
    );
    console.log(`[mongo:seed] users: inserted ${users.length}`);

    const communities = [
      ...unique(
        () => ({
          _id: new ObjectId(),
          community_name: `${randomChoice(nouns)} ${randomChoice(nouns)} ${Math.floor(1000 + Math.random() * 9000)}`,
          community_desc: `A place to share ${randomChoice(interests).toLowerCase()} ideas and discoveries.`,
          community_guidelines: "Be respectful, stay on topic, and share useful context.",
          population: 0,
          community_banner: null,
          admin_id: randomChoice(users)._id,
          tags: randomSubset(tags, 1, 4),
          post_count: 0,
          timestamp: randomDate(90),
        }),
        (community) => community.community_name,
        communityCount,
      ),
    ];
    await communitiesCollection.insertMany(communities);
    console.log(`[mongo:seed] communities: inserted ${communities.length}`);

    const posts = Array.from({ length: postCount }, () => {
      const user = randomChoice(users);
      return {
        _id: new ObjectId(),
        user_id: user._id,
        community_id: Math.random() < 0.8 ? randomChoice(communities)._id : null,
        title: `${randomChoice(adjectives)} ${randomPhrase(2)}`,
        content: `${randomPhrase(6)} ${randomPhrase(5)}.`,
        tags: randomSubset(tags, 1, 3),
        favorite_count: 0,
        popularity_score: new Double(0),
        comment_count: 0,
        time_created: randomDate(60),
        last_edited_at: null,
        media: [],
        user_summary: userSummary(user),
      };
    });
    await postsCollection.insertMany(posts);
    console.log(`[mongo:seed] posts: inserted ${posts.length}`);

    const comments = Array.from({ length: commentCount }, () => {
      const user = randomChoice(users);
      const post = randomChoice(posts);
      return {
        _id: new ObjectId(),
        user_id: user._id,
        post_id: post._id,
        content: randomPhrase(3),
        root: null,
        user_summary: userSummary(user),
        favorite_count: 0,
        reply_count: 0,
        timestamp: new Date(),
        last_edited_at: null,
      };
    });
    await commentsCollection.insertMany(comments);
    const commentCounts = new Map<string, number>();
    for (const comment of comments) {
      const postId = comment.post_id.toHexString();
      commentCounts.set(postId, (commentCounts.get(postId) ?? 0) + 1);
    }
    await Promise.all(
      [...commentCounts].map(([postId, count]) =>
        postsCollection.updateOne(
          { _id: new ObjectId(postId) },
          {
            $inc: { comment_count: count },
            $set: { popularity_score: new Double(count) },
          },
        ),
      ),
    );
    const communityPostCounts = new Map<string, number>();
    for (const post of posts) {
      if (post.community_id) {
        const communityId = post.community_id.toHexString();
        communityPostCounts.set(communityId, (communityPostCounts.get(communityId) ?? 0) + 1);
      }
    }
    await Promise.all(
      [...communityPostCounts].map(([communityId, count]) =>
        communitiesCollection.updateOne(
          { _id: new ObjectId(communityId) },
          { $inc: { post_count: count } },
        ),
      ),
    );
    console.log(`[mongo:seed] comments: inserted ${comments.length}`);

    const notifications = Array.from({ length: notificationCount }, () => {
      const targetUser = randomChoice(users);
      const eventUser = randomChoice(users.filter(u => u._id.toString() !== targetUser._id.toString()));
      return {
        _id: new ObjectId(),
        target_id: targetUser._id,
        event_type: "user_follow",
        event_id: eventUser._id,
        read: false,
        timestamp: new Date(),
      };
    });
    await notificationsCollection.insertMany(notifications);
    console.log(`[mongo:seed] notifications: inserted ${notifications.length}`);

    const commentFavorites = [];
    const commentFavoritePairs = new Set<string>();
    while (commentFavorites.length < commentFavoriteCount) {
      const user = randomChoice(users);
      const comment = randomChoice(comments);
      const pairKey = `${comment._id.toHexString()}-${user._id.toHexString()}`;
      if (!commentFavoritePairs.has(pairKey)) {
        commentFavoritePairs.add(pairKey);
        commentFavorites.push({
          comment_id: comment._id,
          user_id: user._id,
        });
      }
    }
    await commentFavoriteStoreCollection.insertMany(commentFavorites);
    const commentFavoriteCounts = new Map<string, number>();
    for (const favorite of commentFavorites) {
      const commentId = favorite.comment_id.toHexString();
      commentFavoriteCounts.set(commentId, (commentFavoriteCounts.get(commentId) ?? 0) + 1);
    }
    await Promise.all(
      [...commentFavoriteCounts].map(([commentId, count]) =>
        commentsCollection.updateOne(
          { _id: new ObjectId(commentId) },
          { $inc: { favorite_count: count } },
        ),
      ),
    );
    console.log(`[mongo:seed] comment_favorite_store: inserted ${commentFavorites.length}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error("[mongo:seed] failed", error);
  process.exitCode = 1;
});
