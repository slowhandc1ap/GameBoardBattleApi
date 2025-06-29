import { Request, Response } from "express";
import * as BattleService from "../../../services/inGame/battle/battle.service"

export const handleStartBattle = async (req: Request, res: Response) => {
    try {
        const { attackerTeamId, attackerOrder } = req.body;
        const result = await BattleService.startBattle(attackerTeamId, attackerOrder);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            message: "เกิดข้อผิดพลาดในการเริ่มต่อสู้",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
}