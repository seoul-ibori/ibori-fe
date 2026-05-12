import { APIService } from '@/api/api';

const unwrapEnvelope = (body) =>
  body != null && typeof body === 'object' && 'data' in body && body.data !== undefined
    ? body.data
    : body;

/** `GET /api/ai-summaries/{recordId}` */
export const getAiSummary = async (recordId) => {
  const id = recordId == null ? '' : String(recordId).trim();
  if (!id) throw new Error('MISSING_RECORD_ID');
  const res = await APIService.private.get(`/ai-summaries/${encodeURIComponent(id)}`);
  return unwrapEnvelope(res);
};

/** `DELETE /api/ai-summaries/{recordId}` */
export const deleteAiSummary = async (recordId) => {
  const id = recordId == null ? '' : String(recordId).trim();
  if (!id) throw new Error('MISSING_RECORD_ID');
  await APIService.private.delete(`/ai-summaries/${encodeURIComponent(id)}`);
};

/**
 * `POST /api/ai-summaries`
 * - 기존 일정: `recordId` + `audioFile` (childId 생략 가능)
 * - 일정 없음: `childId` + `audioFile` → 서버가 의료 기록 생성 후 `recordId` 반환
 */
export const postAiSummary = async ({ childId, recordId, audioFile, fileName }) => {
  const formData = new FormData();
  if (audioFile instanceof Blob) {
    formData.append('audioFile', audioFile, fileName || 'recording.webm');
  }

  const params = {};
  if (childId != null && childId !== '') params.childId = childId;
  if (recordId != null && recordId !== '') params.recordId = recordId;

  const res = await APIService.private.post('/ai-summaries', formData, {
    params,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrapEnvelope(res);
};
