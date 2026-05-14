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

export const getCheckUserName = async ({ username }) => {
  const res = await APIService.public.get('/auth/check-username', { params: { username } });

  return res.data;
};

export const getCheckfamilyCode = async ({ familyCode }) => {
  const res = await APIService.public.get('/auth/check-family-code', { params: { familyCode } });

  return res.data;
};

export const deleteUser = async ({ userId }) => {
  await APIService.public.delete(`/admin/users/${userId}`);
};
