import { Router } from "express";
import { login, logout, register } from "./handlers.ts";
const router = Router();
router.post("/users", register);
router.post("/sessions", login);
router.delete("/sessions/current", logout);
export default router;
