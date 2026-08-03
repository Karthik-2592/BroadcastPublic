import express, { type Express } from "express";
import auth from "./handlers/auth/routes.ts";
import users from "./handlers/users/routes.ts";
import posts from "./handlers/posts/routes.ts";
import { standalone as comments } from "./handlers/comments/routes.ts";
import communities from "./handlers/communities/routes.ts";
import notifications from "./handlers/notifications/routes.ts";
import { store } from "./store.ts";
import { startAggregationWorker } from "./services/favorites.ts";
import relations from "./relations/routes.ts";
import cors from "cors";
import { logFailure } from "./http.ts";

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: "http://localhost:5173" }));

  startAggregationWorker();
  app.use(express.json({ limit: "2mb" }));
  app.get("/health", async (_req, res) => {
    let connected = false;
    try {
      connected = await store.ping();
    } catch (error) {
      console.log("[mongo] health check failed", error);
    }
    return res.status(connected ? 200 : 503).json({
      success: connected,
      message: connected
        ? "Broadcast API and MongoDB are running."
        : "MongoDB is unavailable.",
      data: { database: connected ? "connected" : "unavailable" },
    });
  });
  app.use("/v1", auth);
  app.use("/v1/users", users);
  app.use("/v1/posts", posts);
  app.use("/v1/comments", comments);
  app.use("/v1/communities", communities);
  app.use("/v1/notifications", notifications);
  app.use("/v1/relations", relations);
  app.use((req, res) => {
    logFailure(req, 404, "Route not found.");
    return res
      .status(404)
      .json({ success: false, message: "Route not found." });
  });
  app.use(
    (
      error: unknown,
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof SyntaxError) {
        logFailure(req, 400, "Malformed JSON request.");
        return res
          .status(400)
          .json({ success: false, message: "Malformed JSON request." });
      }
      logFailure(req, 500, "Internal server error.");
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    },
  );
  return app;
}
