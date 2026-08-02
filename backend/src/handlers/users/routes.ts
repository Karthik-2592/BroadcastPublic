import { Router } from "express";
import {
  deleteUser,
  getUser,
  listRelations,
  recommendations,
  searchUsers,
  updateUser,
} from "./handlers.ts";
import { save, savedPosts, unsave } from "../posts/handlers.ts";

const router = Router();
router.get("/search", searchUsers);
router.get("/:id/recommendations", recommendations);
router.get("/:id/followers", (q, r) => listRelations(q, r, true));
router.get("/:id/following", (q, r) => listRelations(q, r, false));
router.get("/:id/saved-posts", savedPosts);
router.post("/:user_id/saved-posts/:id", save);
router.delete("/:user_id/saved-posts/:id", unsave);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
export default router;
