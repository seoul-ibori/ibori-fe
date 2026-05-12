import { APIService } from '@/api/api';

export const getDistirctSearch = async ({ keyword }) => {
  const res = await APIService.public.get('/district/search', { params: { keyword } });

  return res.data;
};
