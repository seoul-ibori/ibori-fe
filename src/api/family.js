import { APIService } from '@/api/api';

export const getFamily = async () => {
  const res = await APIService.private.get('/families/members');

  return res.data;
};

export const deleteFamily = async (memberId) => {
  await APIService.private.delete(`/families/members/${memberId}`);
};

export const patchFamilyCode = async ({ familyCode }) => {
  await APIService.private.patch('/families', { familyCode });
};
