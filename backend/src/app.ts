import express, { type Express } from "express";
import auth from "./handlers/authController.ts";
import users from "./handlers/usersController.ts";
import posts from "./handlers/postsController.ts";
import { standalone as comments } from "./handlers/commentsController.ts";
import communities from "./handlers/communitiesController.ts";
import notifications from "./handlers/notificationsController.ts";
import { store } from "./mongodb.ts";
import { startAggregationWorker } from "./services/favorites.ts";
import cors from "cors";
import { logFailure } from "./http.ts";
import { sessionMiddleware } from "./session.ts";
import { search } from "./handlers/searchController.ts";
import { imageUpload } from "./media.ts";
import { uploadPostMedia } from "./handlers/postsController.ts";
import { uploadProfilePicture } from "./handlers/usersController.ts";
import { uploadBanner } from "./handlers/communitiesController.ts";
import { requireSession } from "./session.ts";
import feed from "./handlers/feedController.ts";

export function createApp(): Express {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(sessionMiddleware);

  startAggregationWorker();
  app.use(express.json({ limit: "4mb" }));
  app.get("/search", search);
  app.use("/feed", feed);
  app.post("/posts/:id/media", requireSession, imageUpload.array("media", 3), uploadPostMedia);
  app.post("/users/:id/profile-picture", requireSession, imageUpload.array("media", 1), uploadProfilePicture);
  app.post("/communities/:id/banner", requireSession, imageUpload.array("media", 1), uploadBanner);
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
  app.use("/auth", auth);
  app.use("/users", users);
  app.use("/posts", posts);
  app.use("/comments", comments);
  app.use("/communities", communities);
  app.use("/notifications", notifications);
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
      console.log(error);
      if (error instanceof SyntaxError) {
        logFailure(req, 400, "Malformed JSON request.");
        return res
          .status(400)
          .json({ success: false, message: "Malformed JSON request." });
      }
      if (error && typeof error === "object" && "code" in error && error.code === "LIMIT_FILE_SIZE") {
        logFailure(req, 413, "Image must be 2 MB or smaller.");
        return res.status(413).json({ success: false, message: "Image must be 2 MB or smaller." });
      }
      logFailure(req, 500, "Internal server error.");
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    },
  );
  return app;
}
