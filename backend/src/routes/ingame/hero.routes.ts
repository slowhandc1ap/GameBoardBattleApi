// routes/heroRoutes.ts
import { Router } from 'express';
import { getUserHeroesController } from '../../controllers/Ingame/heroController.controller';

const router = Router();

// GET /heroes/:userId
router.get('/heroes/:userId', getUserHeroesController);

export default router;
