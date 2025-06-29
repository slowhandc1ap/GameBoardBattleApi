// controllers/heroController.ts
import { Request, Response } from 'express';
import { getUserHeroes } from '../../services/inGame/getUserCharacter.service';

export const getUserHeroesController = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const heroes = await getUserHeroes(userId);
    res.json({ success: true, heroes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
