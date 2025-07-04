import { Request, Response } from 'express';
import { handleGachaDraw } from '../../services/gacha/gacha.service';
import { log } from 'console';

export const drawCharacter = async (req: Request, res: Response) => {
    log('Received gacha draw request:', req.body);
  const { userId } = req.body;

  try {
    const result = await handleGachaDraw(userId);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: (err as Error).message });
  }
};
