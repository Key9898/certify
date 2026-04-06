import { get, post } from './api';
import type { ApiResponse, User } from '@/types';

export const getMe = async (): Promise<ApiResponse<User>> => {
  return get<User>('/auth/me');
};

export const syncUser = async (userData: {
  email: string;
  name: string;
  avatar?: string;
}): Promise<ApiResponse<User>> => {
  return post<User>('/auth/sync', userData);
};
