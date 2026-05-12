import { APIService } from '@/api/api';

export const getHospital = async (mapData) => {
  const res = await APIService.public.get('/hospital', { params: mapData });

  return res.data;
};

export const getHospitalDetail = async (hospitalId) => {
  const res = await APIService.public.get(`/hospital/${hospitalId}`);

  return res.data;
};
