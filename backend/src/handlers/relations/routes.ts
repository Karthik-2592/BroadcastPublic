import { Router } from "express";
import * as h from "./handlers.ts";
const r = Router();
r.post("/users/:id/followers", h.follow);
r.delete("/users/:id/followers", h.unfollow);
r.post("/posts/:post_id/comments/:comment_id/favorites", h.favoriteComment);
r.delete("/posts/:post_id/comments/:comment_id/favorites", h.unfavoriteComment);
export default r;
