import { Router } from 'express';
import { checkJwt, attachUser } from '../middleware/auth';
import { validateObjectId } from '../middleware/validate';
import { teamLimiter } from '../middleware/rateLimiter';
import {
  updateSettings,
  deleteAccount,
  changePassword,
} from '../controllers/userController';
import {
  cancelTeamInvitation,
  getTeamWorkspace,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from '../controllers/teamController';

const router = Router();

router.patch('/settings', checkJwt, attachUser, updateSettings);
router.post('/change-password', checkJwt, attachUser, changePassword);
router.delete('/account', checkJwt, attachUser, deleteAccount);
router.get('/team', checkJwt, attachUser, getTeamWorkspace);
router.post(
  '/team/invitations',
  checkJwt,
  attachUser,
  teamLimiter,
  inviteTeamMember
);
router.patch(
  '/team/members/:userId',
  checkJwt,
  attachUser,
  validateObjectId('userId'),
  teamLimiter,
  updateTeamMemberRole
);
router.delete(
  '/team/members/:userId',
  checkJwt,
  attachUser,
  validateObjectId('userId'),
  teamLimiter,
  removeTeamMember
);
router.delete(
  '/team/invitations/:invitationId',
  checkJwt,
  attachUser,
  validateObjectId('invitationId'),
  teamLimiter,
  cancelTeamInvitation
);

export default router;
