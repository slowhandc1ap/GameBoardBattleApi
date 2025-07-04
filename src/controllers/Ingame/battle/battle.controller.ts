import { Request, Response } from "express";
import * as BattleService from "../../../services/inGame/battle/battle.service"

export const handleStartBattle = async (req: Request, res: Response) => {
    try {
        const { attackerTeamId, attackerAttackOrder ,attackerDefenseOrder } = req.body;
        const result = await BattleService.startBattle(attackerTeamId, attackerAttackOrder ,attackerDefenseOrder);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเริ่มต่อสู้",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}


export const getBattleDetail = async (req: Request, res: Response) => {
  try {
    const battleId = req.params.id;
    const result = await BattleService.getBattleDetail(battleId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "ดึงข้อมูลการต่อสู้ไม่สำเร็จ",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};
