import express from "express";
import { handleStartBattle } from "../../../controllers/Ingame/battle/battle.controller";

const router = express.Router();

router.post("/start", handleStartBattle)

export default router;