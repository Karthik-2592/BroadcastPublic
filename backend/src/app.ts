import express, { type Express } from "express";
import auth from "./handlers/auth/routes.ts";
import users from "./handlers/users/routes.ts";
import posts from "./handlers/posts/routes.ts";
import cors from "cors";
import { standalone as comments } from "./handlers/comments/routes.ts";
import communities from "./handlers/communities/routes.ts";
import relations from "./handlers/relations/routes.ts";
import notifications from "./handlers/notifications/routes.ts";

export function createApp(): Express {
  const app = express();
  app.use(express.json({ limit: "2mb" }));
  app.get("/health", (_req, res) => {
    console.log("Health check.")
    return res.json({
      success: true,
      message: "Broadcast API is running.",
      data: { mode: "in-memory" },
    })
  });
  app.use("/v1", auth);
  app.use("/v1/users", users);
  app.use("/v1/posts", posts);
  app.use("/v1/comments", comments);
  app.use("/v1/communities", communities);
  app.use("/v1", relations);
  app.use("/v1/notifications", notifications);
  app.use((_req, res) =>
    res.status(404).json({ success: false, message: "Route not found." }),
  );
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof SyntaxError)
        return res
          .status(400)
          .json({ success: false, message: "Malformed JSON request." });
      return res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    },
  );
  return app;
}
