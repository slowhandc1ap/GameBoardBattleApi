import { Request, Response } from 'express';
import {
  createTeamService,
  getTeamsByUserId,
  setDefenseTeam,
  deleteTeamService,
  updateTeamNameService,
  setDefenseFormation,
  getDefenseFormationByTeamId
} from '../../services/inGame/team.service';

export const createTeam = async (req: Request, res: Response) => {
  const { teamName, userId, heroIds } = req.body

  if (!teamName || !userId || !Array.isArray(heroIds) || heroIds.length === 0) {
    res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    return
  }

  try {
    const team = await createTeamService(userId, teamName, heroIds)
    res.status(201).json({ Message: 'สร้างทีมสำเร็จ', team });
  }
  catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการสร้างทีม' });
  }
}


export const getUserTeams = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const teams = await getTeamsByUserId(userId);
    res.json({ teams });
  } catch (error) {
    console.error('[TeamController] getUserTeams error:', error);
    res.status(500).json({ message: 'โหลดทีมล้มเหลว' });
  }
};

export const setDefenseTeamController = async (req: Request, res: Response) => {
  const { userId, teamId } = req.body;

  try {
    const updated = await setDefenseTeam(userId, teamId);
    res.json({ success: true, team: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "ตั้งทีมตั้งรับไม่สำเร็จ" });
  }
};

// controllers/team.controller.ts
export const deleteTeam = async (req: Request, res: Response) => {
  const teamId = req.params.id;
  try {
    await deleteTeamService(teamId);
     res.json({ success: true });
  } catch (err) {
    console.error(err);
     res.status(500).json({ success: false, message: 'ลบทีมไม่สำเร็จ' });
     return
  }
};

// controllers/team.controller.ts
export const updateTeamName = async (req: Request, res: Response) => {
  const { teamId, newName } = req.body;
  if (!newName || !teamId) {
     res.status(400).json({ success: false, message: "ชื่อหรือไอดีทีมไม่ครบ" });
  }

  try {
    await updateTeamNameService(teamId, newName);
     res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'เปลี่ยนชื่อทีมล้มเหลว' });
    return 
  }
};

export const upsertFormation = async (req: Request, res: Response) => {
  try {
    const { teamId, attackOrder, defenseOrder } = req.body;

    if (!teamId || !attackOrder || !defenseOrder) {
       res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบ' });
       return
    }

    // ตรวจสอบว่าลำดับต้องเป็น array และความยาวเท่ากับสมาชิกทีม (เช่น 3 ตัว)
    if (
      !Array.isArray(attackOrder) ||
      !Array.isArray(defenseOrder) ||
      attackOrder.length !== defenseOrder.length
    ) {
       res.status(400).json({ success: false, message: 'ข้อมูลลำดับไม่ถูกต้อง' });
       return
    }

    const result = await setDefenseFormation(teamId, attackOrder, defenseOrder);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('upsertFormation error', error);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

export const fetchDefenseFormation = async (req: Request, res: Response) => {
  const { teamId } = req.params;

  try {
    const formation = await getDefenseFormationByTeamId(teamId);
    if (!formation) {
       res.status(404).json({ success: false, message: "ไม่พบข้อมูลลำดับการตั้งทีม" });
       return
    }

    res.json({ success: true, data: formation });
  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด" });
  }
};