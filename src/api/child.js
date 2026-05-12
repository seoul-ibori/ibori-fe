import { APIService } from '@/api/api';

export const getChildren = async () => {
  const res = await APIService.private.get('/children');
  return res.data;
};

export const patchChildren = async (childId, profileData) => {
  const res = await APIService.private.patch(`/children/${childId}`, profileData);

  return res.data;
};

export const deleteChildren = async (childId) => {
  await APIService.private.delete(`/children/${childId}`);
};
