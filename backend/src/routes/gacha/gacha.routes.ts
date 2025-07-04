import express from 'express';
import { drawCharacter } from '../../controllers/gacha/gacha.controller';

const router = express.Router();

router.post('/draw', drawCharacter);

export default router;
