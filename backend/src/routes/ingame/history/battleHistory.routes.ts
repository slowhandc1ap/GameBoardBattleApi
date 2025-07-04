// routes/battleRoutes.ts

import express from "express";
import { getBattleStats } from "../../../controllers/Ingame/history/battleHistory.controller"

const router = express.Router();

// GET /api/battle/stats/:userId
router.get("/:userId", getBattleStats);

export default router;
