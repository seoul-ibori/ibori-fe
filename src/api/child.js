import { APIService } from '@/api/api';

export const getChildren = async () => {
  const res = await APIService.private.get('/children');
  return res.data;
};
