import { APIService } from '@/api/api';

export const postPredictDong = async ({ dong }) => {
  const res = await APIService.public.post('/predict/dong', { dong });

  return res.data;
};
