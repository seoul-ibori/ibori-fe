import { APIService } from '@/api/api';

export const login = async ({ username, password }) => {
  const res = await APIService.public.post('/auth/login', { username, password });
  return res.data;
};

export const demoLogin = async () => {
  const res = await APIService.public.post('/auth/demo-login');
  return res.data;
};

export const signUp = async (userData) => {
  const res = await APIService.public.post('/auth/signup', userData);
  return res.data;
};
