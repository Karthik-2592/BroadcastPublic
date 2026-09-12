import { MongoClient } from "mongodb";
import neo4j, { type Driver, type Session } from "neo4j-driver";
import { env } from "../src/config/env.ts";

const mongoUri = env.mongoUri;
const databaseName = env.mongoDatabase;
const mongoTimeout = env.mongoServerSelectionTimeoutMs;
const neo4jUri = env.neo4jUri;
const neo4jUsername = env.neo4jUsername;
const neo4jPassword = env.neo4jPassword;
const neo4jDatabase = env.neo4jDatabase;

async function executeWrite(
  session: Session,
  query: string,
  parameters: Record<string, unknown>,
) {
  const result = await session.executeWrite((transaction) =>
    transaction.run(query, parameters),
  );
  return result;
}

async function recalculatePostLikes(
  mongoClient: MongoClient,
  neo4jSession: Session,
) {
  console.log("[recalc] Starting post likes recalculation...");

  const database = mongoClient.db(databaseName);
  const postsCollection = database.collection("posts");

  // Get all posts from MongoDB
  const posts = await postsCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${posts.length} posts to process`);

  let updatedCount = 0;
  for (const post of posts) {
    const postId = post._id.toHexString();

    // Count LIKES relations from Neo4j
    const result = await executeWrite(
      neo4jSession,
      `MATCH (user:USER)-[r:LIKES]->(post:POST {post_id: $postId})
       RETURN count(r) AS likeCount`,
      { postId },
    );

    const likeCount = result.records[0]?.get("likeCount")?.toNumber() || 0;

    // Update the post in MongoDB
    const updateResult = await postsCollection.updateOne(
      { _id: post._id },
      { $set: { favorite_count: likeCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Post likes: updated ${updatedCount} posts`);
  return updatedCount;
}

async function recalculateUserFollowCounts(
  mongoClient: MongoClient,
  neo4jSession: Session,
) {
  console.log("[recalc] Starting user follow counts recalculation...");

  const database = mongoClient.db(databaseName);
  const usersCollection = database.collection("users");

  // Get all users from MongoDB
  const users = await usersCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${users.length} users to process`);

  let updatedCount = 0;
  for (const user of users) {
    const userId = user._id.toHexString();

    // Count followers (users who follow this user)
    const followersResult = await executeWrite(
      neo4jSession,
      `MATCH (follower:USER)-[r:FOLLOWS]->(user:USER {user_id: $userId})
       RETURN count(r) AS followerCount`,
      { userId },
    );

    // Count following (users this user follows)
    const followingResult = await executeWrite(
      neo4jSession,
      `MATCH (user:USER {user_id: $userId})-[r:FOLLOWS]->(followed:USER)
       RETURN count(r) AS followingCount`,
      { userId },
    );

    const followerCount = followersResult.records[0]?.get("followerCount")?.toNumber() || 0;
    const followingCount = followingResult.records[0]?.get("followingCount")?.toNumber() || 0;

    // Update the user in MongoDB
    const updateResult = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { follower_count: followerCount, following_count: followingCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] User follow counts: updated ${updatedCount} users`);
  return updatedCount;
}

async function recalculateCommunityPopulation(
  mongoClient: MongoClient,
  neo4jSession: Session,
) {
  console.log("[recalc] Starting community population recalculation...");

  const database = mongoClient.db(databaseName);
  const communitiesCollection = database.collection("communities");

  // Get all communities from MongoDB
  const communities = await communitiesCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${communities.length} communities to process`);

  let updatedCount = 0;
  for (const community of communities) {
    const communityId = community._id.toHexString();

    // Count PARTICIPATES relations from Neo4j
    const result = await executeWrite(
      neo4jSession,
      `MATCH (user:USER)-[r:PARTICIPATES]->(community:COMMUNITY {community_id: $communityId})
       RETURN count(r) AS population`,
      { communityId },
    );

    const population = result.records[0]?.get("population")?.toNumber() || 0;

    // Update the community in MongoDB
    const updateResult = await communitiesCollection.updateOne(
      { _id: community._id },
      { $set: { population } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Community population: updated ${updatedCount} communities`);
  return updatedCount;
}

async function recalculateCommentLikes(mongoClient: MongoClient) {
  console.log("[recalc] Starting comment likes recalculation...");

  const database = mongoClient.db(databaseName);
  const commentsCollection = database.collection("comments");
  const commentFavoriteStoreCollection = database.collection("comment_favorite_store");

  // Get all comments from MongoDB
  const comments = await commentsCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${comments.length} comments to process`);

  let updatedCount = 0;
  for (const comment of comments) {
    const commentId = comment._id.toHexString();

    // Count favorites from comment_favorite_store collection
    const favoriteCount = await commentFavoriteStoreCollection.countDocuments({
      comment_id: comment._id,
    });

    // Update the comment in MongoDB
    const updateResult = await commentsCollection.updateOne(
      { _id: comment._id },
      { $set: { favorite_count: favoriteCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Comment likes: updated ${updatedCount} comments`);
  return updatedCount;
}

async function recalculatePostCommentCounts(mongoClient: MongoClient) {
  console.log("[recalc] Starting post comment counts recalculation...");

  const database = mongoClient.db(databaseName);
  const postsCollection = database.collection("posts");
  const commentsCollection = database.collection("comments");

  // Get all posts from MongoDB
  const posts = await postsCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${posts.length} posts to process`);

  let updatedCount = 0;
  for (const post of posts) {
    const postId = post._id.toHexString();

    // Count comments for this post
    const commentCount = await commentsCollection.countDocuments({
      post_id: post._id,
    });

    // Update the post in MongoDB
    const updateResult = await postsCollection.updateOne(
      { _id: post._id },
      { $set: { comment_count: commentCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Post comment counts: updated ${updatedCount} posts`);
  return updatedCount;
}

async function recalculateCommentReplyCounts(mongoClient: MongoClient) {
  console.log("[recalc] Starting comment reply counts recalculation...");

  const database = mongoClient.db(databaseName);
  const commentsCollection = database.collection("comments");

  // Get all root comments (comments where root is null)
  const rootComments = await commentsCollection
    .find({ root: null }, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${rootComments.length} root comments to process`);

  let updatedCount = 0;
  for (const rootComment of rootComments) {
    const rootCommentId = rootComment._id.toHexString();

    // Count replies to this root comment
    const replyCount = await commentsCollection.countDocuments({
      root: rootComment._id,
    });

    // Update the root comment in MongoDB
    const updateResult = await commentsCollection.updateOne(
      { _id: rootComment._id },
      { $set: { reply_count: replyCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Comment reply counts: updated ${updatedCount} root comments`);
  return updatedCount;
}

async function recalculateCommunityPostCounts(mongoClient: MongoClient) {
  console.log("[recalc] Starting community post counts recalculation...");

  const database = mongoClient.db(databaseName);
  const communitiesCollection = database.collection("communities");
  const postsCollection = database.collection("posts");

  // Get all communities from MongoDB
  const communities = await communitiesCollection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(`[recalc] Found ${communities.length} communities to process`);

  let updatedCount = 0;
  for (const community of communities) {
    const communityId = community._id.toHexString();

    // Count posts for this community
    const postCount = await postsCollection.countDocuments({
      community_id: community._id,
    });

    // Update the community in MongoDB
    const updateResult = await communitiesCollection.updateOne(
      { _id: community._id },
      { $set: { post_count: postCount } },
    );

    if (updateResult.modifiedCount > 0) {
      updatedCount++;
    }
  }

  console.log(`[recalc] Community post counts: updated ${updatedCount} communities`);
  return updatedCount;
}

async function recalculateAll() {
  const mongo = new MongoClient(mongoUri, {
    serverSelectionTimeoutMS: mongoTimeout,
  });
  const driver: Driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUsername, neo4jPassword),
  );

  try {
    await mongo.connect();
    const neo4jSession = driver.session({ database: neo4jDatabase });

    console.log("[recalc] Connected to MongoDB and Neo4j");
    console.log("[recalc] Starting denormalized data recalculation...");

    try {
      // Recalculate relation-based counts from Neo4j
      const postLikesUpdated = await recalculatePostLikes(mongo, neo4jSession);
      const userFollowCountsUpdated = await recalculateUserFollowCounts(mongo, neo4jSession);
      const communityPopulationUpdated = await recalculateCommunityPopulation(mongo, neo4jSession);

      // Recalculate MongoDB-based counts
      const commentLikesUpdated = await recalculateCommentLikes(mongo);
      const postCommentCountsUpdated = await recalculatePostCommentCounts(mongo);
      const commentReplyCountsUpdated = await recalculateCommentReplyCounts(mongo);
      const communityPostCountsUpdated = await recalculateCommunityPostCounts(mongo);

      console.log("[recalc] Recalculation complete!");
      console.log(`[recalc] Summary:`);
      console.log(`  - Post likes: ${postLikesUpdated} updated`);
      console.log(`  - User follow counts: ${userFollowCountsUpdated} updated`);
      console.log(`  - Community population: ${communityPopulationUpdated} updated`);
      console.log(`  - Comment likes: ${commentLikesUpdated} updated`);
      console.log(`  - Post comment counts: ${postCommentCountsUpdated} updated`);
      console.log(`  - Comment reply counts: ${commentReplyCountsUpdated} updated`);
      console.log(`  - Community post counts: ${communityPostCountsUpdated} updated`);

    } finally {
      await neo4jSession.close();
    }
  } finally {
    await mongo.close();
    await driver.close();
  }
}

recalculateAll().catch((error) => {
  console.error("[recalc] failed", error);
  // console.log(error.errInfo.details);
  // console.log(error.errInfo.details.schemaRulesNotSatisfied);
  // console.log(error.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied);
  // console.log(error.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied[0].details);
  process.exitCode = 1;
});
