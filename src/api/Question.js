import { APIService } from '@/api/api';

export const postQuestion = async (payload) => {
  const res = await APIService.private.post('/question', payload);
  return res.data;
};
