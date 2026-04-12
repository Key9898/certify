import { del, get, patch, post } from './api';
import type { ApiResponse, TeamWorkspace } from '@/types';

export const fetchTeamWorkspace = async (): Promise<
  ApiResponse<TeamWorkspace>
> => {
  return get<TeamWorkspace>('/users/team');
};

export const inviteTeamMember = async (
  email: string,
  role: 'admin' | 'member'
): Promise<
  ApiResponse<{
    _id: string;
    email: string;
    role: 'admin' | 'member';
    status: string;
  }>
> => {
  return post('/users/team/invitations', { email, role });
};

export const updateTeamMemberRole = async (
  userId: string,
  role: 'admin' | 'member'
): Promise<ApiResponse<{ _id: string; role: 'admin' | 'member' }>> => {
  return patch(`/users/team/members/${userId}`, { role });
};

export const removeTeamMember = async (
  userId: string
): Promise<ApiResponse<{ message: string }>> => {
  return del(`/users/team/members/${userId}`);
};

export const cancelTeamInvitation = async (
  invitationId: string
): Promise<ApiResponse<{ message: string }>> => {
  return del(`/users/team/invitations/${invitationId}`);
};
