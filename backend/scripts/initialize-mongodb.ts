import { MongoClient, type Db } from "mongodb";
import { env } from "../src/config/env.ts";

const uri = env.mongoUri;
const databaseName = env.mongoDatabase;
const timeout = env.mongoServerSelectionTimeoutMs;

type CollectionDefinition = {
  name: string;
  validator: Record<string, unknown>;
};

const collections: CollectionDefinition[] = [
  {
    name: "users",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["username", "email", "password"],
        properties: {
          username: { bsonType: "string", minLength: 4, maxLength: 24 },
          email: { bsonType: "string" },
          password: {
            bsonType: "object",
            required: ["password_hash", "salt"],
            properties: {
              password_hash: { bsonType: "string" },
              salt: { bsonType: "string" },
            },
          },
          interests: { bsonType: "array", items: { bsonType: "string" } },
          profile_name: { bsonType: "string", maxLength: 64 },
          profile_picture: {
            bsonType: ["object", "null"],
            required: ["media_id", "media_url", "mime_type"],
            properties: {
              media_id: { bsonType: "int" },
              media_url: { bsonType: "string" },
              mime_type: { bsonType: "string" },
            },
          },
          profile_description: { bsonType: "string", maxLength: 200 },
          follower_count: { bsonType: "int" },
          following_count: { bsonType: "int" },
          pinned_posts: { bsonType: "array", items: { bsonType: "objectId" } },
        },
      },
    },
  },
  {
    name: "passwords",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["username", "password"],
        properties: {
          username: { bsonType: "string" },
          password: { bsonType: "string" },
        },
      },
    },
  },
  {
    name: "posts",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user_id"],
        properties: {
          user_id: { bsonType: ["objectId", "null"] },
          community_id: { bsonType: ["objectId", "null"] },
          title: { bsonType: "string", maxLength: 75 },
          content: { bsonType: "string", maxLength: 200 },
          tags: { bsonType: "array", items: { bsonType: "string" } },
          favorite_count: { bsonType: "int" },
          popularity_score: { bsonType: "double" },
          comment_count: { bsonType: "int" },
          time_created: { bsonType: "date" },
          media: {
            bsonType: "array",
            items: {
              bsonType: ["object", "null"],
              required: ["media_id", "media_url", "mime_type"],
              properties: {
                media_id: { bsonType: "int" },
                media_url: { bsonType: "string" },
                mime_type: { bsonType: "string" },
              },
            },
          },
          user_summary: {
            bsonType: "object",
            required: ["username", "profile_picture"],
            properties: {
              username: { bsonType: "string" },
              profile_picture: { bsonType: ["string", "null"] },
            },
          },
        },
      },
    },
  },
  {
    name: "comments",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["post_id", "user_id", "content"],
        properties: {
          post_id: { bsonType: "objectId" },
          user_id: { bsonType: ["objectId", "null"] },
          root: { bsonType: ["objectId", "null"] },
          content: { bsonType: "string", maxLength: 500 },
          reply_count: { bsonType: "int" },
          favorite_count: { bsonType: "int" },
          timestamp: { bsonType: "date" },
          user_summary: {
            bsonType: "object",
            required: ["username", "profile_picture"],
            properties: {
              username: { bsonType: "string" },
              profile_picture: { bsonType: ["string", "null"] },
            },
          },
        },
      },
    },
  },
  {
    name: "comment_favorite_store",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["comment_id", "user_id"],
        properties: {
          comment_id: { bsonType: "objectId" },
          user_id: { bsonType: "objectId" },
        },
      },
    },
  },
  {
    name: "communities",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["community_name", "admin_id"],
        properties: {
          community_name: { bsonType: "string" },
          community_desc: { bsonType: "string" },
          admin_id: { bsonType: "objectId" },
          population: { bsonType: "int" },
          community_banner: {
            bsonType: ["object", "null"],
            required: ["media_id", "media_url", "mime_type"],
            properties: {
              media_id: { bsonType: "objectId" },
              media_url: { bsonType: "string" },
              mime_type: { bsonType: "string" },
            },
          },
          timestamp: { bsonType: "date" },
          post_count: { bsonType: "int" },
          tags: { bsonType: "array", items: { bsonType: "string" } },
        },
      },
    },
  },
  {
    name: "notifications",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user_id", "event_type", "event_id"],
        properties: {
          user_id: { bsonType: "objectId" },
          event_type: { bsonType: "string" },
          timestamp: { bsonType: "date" },
          event_id: { bsonType: "objectId" },
        },
      },
    },
  },
];

async function createCollectionIfMissing(
  database: Db,
  definition: CollectionDefinition,
) {
  try {
    await database.createCollection(definition.name, {
      validator: definition.validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`[mongo:init] collection ${definition.name}: created`);
  } catch (error: any) {
    if (error?.codeName === "NamespaceExists") {
      await database.command({
        collMod: definition.name,
        validator: definition.validator,
        validationLevel: "strict",
        validationAction: "error",
      });
      console.log(
        `[mongo:init] collection ${definition.name}: validator updated`,
      );
    } else throw error;
  }
}

async function initialize() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: timeout });
  try {
    await client.connect();
    const database = client.db(databaseName);
    for (const definition of collections)
      await createCollectionIfMissing(database, definition);
    await database
      .collection("users")
      .createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true },
        { key: { interests: 1 } },
      ]);
    await database
      .collection("posts")
      .createIndexes([
        { key: { user_id: 1, time_created: -1 } },
        { key: { community_id: 1, popularity_score: -1 } },
        { key: { tags: 1, popularity_score: -1 } },
        { key: { popularity_score: -1 } },
      ]);
    await database
      .collection("comments")
      .createIndexes([
        { key: { post_id: 1, root: 1 } },
        { key: { post_id: 1, root: 1, popularity_score: -1 } },
        { key: { user_id: 1, timestamp: -1 } },
      ]);
    await database
      .collection("comment_favorite_store")
      .createIndex({ comment_id: 1, user_id: 1 }, { unique: true });
    await database
      .collection("communities")
      .createIndexes([
        { key: { community_name: 1 }, unique: true },
        { key: { tags: 1 } },
        { key: { population: -1 } },
      ]);
    await database
      .collection("notifications")
      .createIndex({ user_id: 1, timestamp: -1 });
    console.log(`[mongo:init] indexes: created or verified in ${databaseName}`);
  } finally {
    await client.close();
  }
}

initialize().catch((error) => {
  console.error("[mongo:init] failed", error);
  process.exitCode = 1;
});
