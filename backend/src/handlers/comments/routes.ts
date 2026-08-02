import { Router } from "express";
import * as h from "./handlers.ts";
const router = Router({ mergeParams: true });
router.get("/", h.list);
router.post("/", h.create);
export default router;
export const standalone = Router();
standalone.put("/:id", h.update);
standalone.delete("/:id", h.remove);
