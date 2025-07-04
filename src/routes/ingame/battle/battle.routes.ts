import express from "express";
import { handleStartBattle, getBattleDetail } from "../../../controllers/Ingame/battle/battle.controller";

const router = express.Router();

router.post("/start", handleStartBattle)
router.get("/detail/:id", getBattleDetail); // << ✅ เพิ่มตรงนี้

export default router;