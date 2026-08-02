import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
const databaseName = process.env.MONGODB_DATABASE ?? "broadcast";
const timeout = Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS ?? 5000);

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
          pinned_posts: { bsonType: "array", items: { bsonType: "string" } },
        },
      },
    },
  },
  {
    name: "posts",
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["user_id", "content", "visibility"],
        properties: {
          user_id: { bsonType: ["string", "null"] },
          content: { bsonType: "string", maxLength: 200 },
          visibility: { bsonType: ["string", "null"] },
          popularity_score: {
            bsonType: ["double", "int", "long", "decimal"],
          },
          tags: { bsonType: "array" },
          media: { bsonType: "array" },
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
          post_id: { bsonType: "string" },
          user_id: { bsonType: ["string", "null"] },
          content: { bsonType: "string", maxLength: 500 },
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
          admin_id: { bsonType: ["string", "null"] },
          tags: { bsonType: "array" },
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
          user_id: { bsonType: "string" },
          event_type: { bsonType: "string" },
          event_id: { bsonType: "string" },
          read: { bsonType: "bool" },
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
    if (error?.codeName === "NamespaceExists")
      console.log(`[mongo:init] collection ${definition.name}: already exists`);
    else throw error;
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
