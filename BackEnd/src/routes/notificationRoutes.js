import express from "express";
import {
  subscribe,
  broadcastNotification,
  testNotification,
} from "../controllers/notificationsController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/subscribe", subscribe);
router.post("/test", testNotification);
router.post("/broadcast", authMiddleware, adminMiddleware, broadcastNotification);

export default router;
