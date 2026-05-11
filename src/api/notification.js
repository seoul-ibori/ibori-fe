import { APIService } from '@/api/api';

export const getNotification = async () => {
  const res = await APIService.private.get('/notifications');

  return res.data;
};

export const postReadAll = async () => {
  await APIService.private.patch('/notifications/read-all');
};
