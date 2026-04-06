import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { updateSettings } from '../controllers/userController';
import {
  cancelTeamInvitation,
  getTeamWorkspace,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from '../controllers/teamController';

const router = Router();

router.patch('/settings', checkJwt, attachUser, updateSettings);
router.get('/team', checkJwt, attachUser, getTeamWorkspace);
router.post('/team/invitations', checkJwt, attachUser, inviteTeamMember);
router.patch('/team/members/:userId', checkJwt, attachUser, updateTeamMemberRole);
router.delete('/team/members/:userId', checkJwt, attachUser, removeTeamMember);
router.delete('/team/invitations/:invitationId', checkJwt, attachUser, cancelTeamInvitation);

export default router;
