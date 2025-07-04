import express from 'express';
import { createTeam} from '../../controllers/Ingame/team.controller'
import { getUserTeams , setDefenseTeamController , deleteTeam, updateTeamName ,upsertFormation , fetchDefenseFormation } from '../../controllers/Ingame/team.controller'
const router = express.Router();
router.get('/user/:userId', getUserTeams);

router.post('/create', createTeam);
router.post('/set-defense', setDefenseTeamController);
router.delete('/delete/:id', deleteTeam);
router.put('/update-name', updateTeamName);
router.put('/defense-formation', upsertFormation);
router.get("/defense-formation/:teamId", fetchDefenseFormation);

export default router;
