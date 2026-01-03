import express from "express";
import {
  getStats,
  getLogs,
  addLog,
  deleteOldLogs,
} from "../controllers/vehiclesController.js";
import { authMiddleware, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", authMiddleware, getStats);
router.get("/logs", authMiddleware, getLogs);
router.post("/logs", addLog);
router.delete("/logs/cleanup", authMiddleware, adminMiddleware, deleteOldLogs);

export default router;
