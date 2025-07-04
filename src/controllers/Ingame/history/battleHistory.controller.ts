// controllers/battleStatsController.ts

import { Request, Response } from "express";
import { getBattleHistoriesByUserId } from "../../../services/inGame/history/battleHistory.service"

export const getBattleStats = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return 
  }

  try {
    const battles = await getBattleHistoriesByUserId(userId);
    res.json({ battles });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch battle stats" });
  }
};
