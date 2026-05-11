import { APIService } from '@/api/api';

export const postMedicalRecords = async (codefData) => {
  const res = await APIService.public.post('/codef/medical-records', codefData);

  return res.data;
};

export const postMedicalRecords2Way = async (codefData) => {
  const res = await APIService.private.post('/codef/medical-records/2way', codefData);

  return res.data;
};
