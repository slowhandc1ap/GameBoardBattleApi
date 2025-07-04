import express from "express";
import { getLeaderboardController } from "../../../controllers/Ingame/leaderboard/leaderboard.controller";

const router = express.Router();

router.get("/getall", getLeaderboardController);

export default router;
