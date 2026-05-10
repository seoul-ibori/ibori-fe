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

const unwrapEnvelope = (body) =>
  body != null && typeof body === 'object' && 'data' in body && body.data !== undefined
    ? body.data
    : body;

export const getMedicalRecordDetail = async (recordId) => {
  const res = await APIService.private.get(`/medical-records/${recordId}`);
  return unwrapEnvelope(res);
};

export const postMedicalRecord = async (payload) => {
  const res = await APIService.private.post('/medical-records', payload);
  return unwrapEnvelope(res);
};

export const patchMedicalRecord = async (recordId, payload) => {
  const res = await APIService.private.patch(`/medical-records/${recordId}`, payload);
  return unwrapEnvelope(res);
};

export const deleteMedicalRecord = async (recordId) => {
  await APIService.private.delete(`/medical-records/${recordId}`);
};
