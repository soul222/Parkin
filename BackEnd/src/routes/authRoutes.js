import express from "express";
import {
  register,
  login,
  logout,
  validateToken,
} from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/validate", authMiddleware, validateToken);

export default router;
