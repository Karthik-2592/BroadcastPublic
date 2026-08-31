import { createHash, randomBytes } from "node:crypto";
import { Double, MongoClient, ObjectId } from "mongodb";
import { env } from "../src/config/env.ts";


const uri = env.mongoUri;
const databaseName = env.mongoDatabase;
const timeout = env.mongoServerSelectionTimeoutMs;
const configuredPublicCommunityId = env.publicCommunityId;
if (!ObjectId.isValid(configuredPublicCommunityId))
  throw new Error("PUBLIC_COMMUNITY_ID must be a valid MongoDB ObjectId");
const publicCommunityId = new ObjectId(configuredPublicCommunityId);
const userCount = env.sampleUserCount;
const communityCount = env.sampleCommunityCount;
const postCount = env.samplePostCount;
const commentCount = env.sampleCommentCount;

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
          interests: [],
          profile_name: username,
          profile_picture: null,
          profile_description: "",
          pinned_posts: [],
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

    const publicCommunity = {
      _id: publicCommunityId,
      community_name: "Public Community",
      community_desc: "",
      community_guidelines: "",
      population: 0,
      community_banner: null,
      admin_id: randomChoice(users)._id,
      tags: [],
      post_count: 0,
      timestamp: new Date(),
    };
    const communities = [
      ...unique(
        () => ({
          _id: new ObjectId(),
          community_name: `${randomChoice(nouns)} ${randomChoice(nouns)}`,
          community_desc: "",
          community_guidelines: "",
          population: 0,
          community_banner: null,
          admin_id: randomChoice(users)._id,
          tags: [],
          post_count: 0,
          timestamp: new Date(),
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
        community_id: publicCommunity._id,
        title: randomPhrase(3),
        content: "",
        tags: [],
        favorite_count: 0,
        popularity_score: new Double(0),
        comment_count: 0,
        time_created: new Date(),
        last_edited_at: null,
        media: [],
        user_summary: {
          username: user.username,
          profile_picture: null,
        },
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
        user_summary: {
          username: user.username,
          profile_picture: null,
        },
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
          { $inc: { comment_count: count } },
        ),
      ),
    );
    console.log(`[mongo:seed] comments: inserted ${comments.length}`);
  } finally {
    await client.close();
  }
}

seed().catch((error) => {
  console.error("[mongo:seed] failed", error);
  process.exitCode = 1;
});
