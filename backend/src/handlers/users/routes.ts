import { Router } from "express";
import {
  deleteUser,
  getUser,
  recommendations,
  searchUsers,
  updateUser,
} from "./handlers.ts";

const router = Router();
router.get("/search", searchUsers);
router.get("/:id/recommendations", recommendations);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
export default router;
