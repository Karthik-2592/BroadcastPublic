import { Router } from "express";
import * as h from "./handlers.ts";
const r = Router();
r.get("/", h.list);
r.patch("/:id", h.read);
r.delete("/:id", h.remove);
export default r;
