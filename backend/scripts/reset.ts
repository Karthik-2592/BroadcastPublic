import neo4j from "neo4j-driver";
import { MongoClient } from "mongodb";
import { env } from "../src/config/env.ts";


async function resetMongo() {
  const client = new MongoClient(env.mongoUri, {
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
  });

  try {
    await client.connect();
    const database = client.db(env.mongoDatabase);
    const collections = await database.listCollections({}, { nameOnly: true }).toArray();

    for (const collection of collections) {
      await database.dropCollection(collection.name);
      console.log(`[mongo:reset] dropped collection ${collection.name}`);
    }
  } finally {
    await client.close();
  }
}

async function resetNeo4j() {
  const driver = neo4j.driver(
    env.neo4jUri,
    neo4j.auth.basic(env.neo4jUsername, env.neo4jPassword),
  );
  const session = driver.session({ database: env.neo4jDatabase });

  try {
    await session.executeWrite((transaction) =>
      transaction.run("MATCH (node) DETACH DELETE node"),
    );
    console.log("[neo4j:reset] deleted all nodes and relationships");
  } finally {
    await session.close();
    await driver.close();
  }
}

async function reset() {
  await resetMongo();
  await resetNeo4j();
  console.log("[reset] MongoDB and Neo4j reset complete");
}

reset().catch((error) => {
  console.error("[reset] failed", error);
  process.exitCode = 1;
});
