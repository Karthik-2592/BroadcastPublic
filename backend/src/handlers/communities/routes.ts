import { Router } from "express";
import * as h from "./handlers.ts";
const r = Router();
r.get("/recommendations", h.recommendations);
r.post("/", h.create);
r.get("/:id", h.get);
r.put("/:id", h.update);
r.delete("/:id", h.remove);
export default r;
