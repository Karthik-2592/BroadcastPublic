import { Router } from "express";
import * as handlers from "./handlers.ts";

const router = Router();
router.post("/follows", handlers.follow);
router.delete("/follows", handlers.follow);
router.post("/posts/likes", handlers.postLike);
router.delete("/posts/likes", handlers.postLike);
router.post("/comments/likes", handlers.commentLike);
router.delete("/comments/likes", handlers.commentLike);
router.post("/saves", handlers.save);
router.delete("/saves", handlers.save);
router.post("/moderators", handlers.moderate);
router.delete("/moderators", handlers.moderate);
router.post("/memberships", handlers.membership);
router.delete("/memberships", handlers.membership);

export default router;
