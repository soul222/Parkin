import express from "express";
import {
  getSettings,
  updateSettings,
} from "../controllers/settingsController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSettings);
router.put("/", authMiddleware, adminMiddleware, updateSettings);

export default router;
