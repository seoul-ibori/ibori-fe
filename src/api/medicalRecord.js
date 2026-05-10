import { APIService } from '@/api/api';

export const getMedicalRecord = async ({ year, month, childId, date }) => {
  const res = await APIService.private.get('/medical-records', {
    params: {
      year,
      month,
      childId,
      date,
    },
  });

  return res.data;
};
