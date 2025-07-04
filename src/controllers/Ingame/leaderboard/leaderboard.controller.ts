import { Request, Response } from "express";
import { getAllLeaderboard } from "../../../services/inGame/leaderBoard/getAllLeaderboard.service"

export const getLeaderboardController = async (req: Request, res: Response) => {
  try {
    const leaderboard = await getAllLeaderboard();
    res.status(200).json({ leaderboard });
  } catch (err) {
    console.error("Failed to fetch leaderboard:", err);
    res.status(500).json({ message: "ไม่สามารถโหลดข้อมูลอันดับได้" });
  }
};
