import { useMemo } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getMedicalRecordDetail } from '@/api/medicalRecord';
import HumanIcon from '@/assets/icons/human.svg?react';
import MedicineIcon from '@/assets/icons/medicine.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import PlaceIcon from '@/assets/icons/place.svg?react';
import Button from '@/components/common/Button';

function InfoItem({
  icon,
  text,
  recording = false,
  highlight = false,
  muted = false,
  danger = false,
}) {
  const textClass = danger
    ? 'text-[12px] font-medium leading-none text-[#C45C4A]'
    : muted
      ? 'text-[12px] font-medium leading-none text-[#B9B2A6]'
      : recording
        ? 'text-[12px] font-semibold leading-none text-[#FF3D00]'
        : highlight
          ? 'text-[12px] font-semibold leading-none text-[#E28702]'
          : 'text-[12px] font-medium leading-none text-[#706963]';

  return (
    <div className="flex items-center gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FFC721]">
        {icon}
      </span>
      <p className={textClass}>{text}</p>
    </div>
  );
}

function detailPayload(detail) {
  if (!detail || typeof detail !== 'object') return null;
  return detail.data && typeof detail.data === 'object' ? detail.data : detail;
}

function firstCodefMedicalRecord(detail) {
  const inner = detailPayload(detail);
  if (!inner) return null;
  const mr = inner.medicalRecords;
  return Array.isArray(mr) && mr[0] && typeof mr[0] === 'object' ? mr[0] : null;
}

function medicationsFromDetail(detail) {
  const inner = detailPayload(detail);
  if (!inner) return [];

  // CODEF 2차 등: { medicalRecords: [ { medications: [...] }, ... ] }
  const medicalRecords = inner.medicalRecords;
  if (Array.isArray(medicalRecords) && medicalRecords.length) {
    const merged = [];
    for (const rec of medicalRecords) {
      if (rec && typeof rec === 'object' && Array.isArray(rec.medications)) {
        merged.push(...rec.medications);
      }
    }
    if (merged.length) return merged;
  }

  const raw =
    inner.medications ??
    inner.medicationList ??
    inner.prescriptionMedications ??
    inner.prescriptions;
  if (!Array.isArray(raw)) return [];
  return raw;
}

function formatMedicationsLine(medications) {
  if (!medications?.length) return '';
  return medications
    .map((m) => {
      if (m == null || typeof m !== 'object') return '';
      const name = m.drugName ?? m.name ?? m.medicineName ?? m.drug ?? '';
      const days = m.prescribeDays ? `${m.prescribeDays}일` : '';
      const effect = m.drugEffect ?? m.effect ?? '';
      return [name, days, effect].filter(Boolean).join(' · ');
    })
    .filter(Boolean)
    .join(', ');
}

export default function CalenderForm({
  label,
  time,
  location,
  memo,
  childId,
  childLabelColor = '#5AA7FF',
  childDisplayName = '',
  fromRecording = false,
  medicineText = '',
  recordId,
  onViewSummary = () => {},
  onAddRecording = () => {},
}) {
  const numericRecordId = useMemo(() => {
    if (recordId == null) return null;
    const n = Number(recordId);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }, [recordId]);

  const {
    data: detailRaw,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    queryKey: ['medicalRecord', 'detail', numericRecordId],
    queryFn: () => getMedicalRecordDetail(numericRecordId),
    enabled: numericRecordId != null,
  });

  const detail = detailRaw && typeof detailRaw === 'object' ? detailRaw : null;

  const hasRecord = numericRecordId != null;
  const firstMr = firstCodefMedicalRecord(detail);
  const displayLocation = String(
    detail?.hospitalName ?? firstMr?.hospitalName ?? location ?? ''
  ).trim();
  const displayMemo = String(detail?.memo ?? memo ?? '').trim();
  const displayChild =
    (detail?.childName && String(detail.childName).trim()) ||
    (firstMr?.subjectName && String(firstMr.subjectName).trim()) ||
    String(childDisplayName ?? '').trim() ||
    '';
  const medsList = medicationsFromDetail(detail);
  const medicineFromApi = formatMedicationsLine(medsList).trim();
  const medicineFromProp = String(medicineText ?? '').trim();
  const showMedicineRow = hasRecord || Boolean(medicineFromProp);

  const medicineRowText = (() => {
    if (!hasRecord) return medicineFromProp;
    if (detailLoading) return '투약 정보를 불러오는 중…';
    if (detailError) return '투약 정보를 불러오지 못했어요';
    if (medicineFromApi) return medicineFromApi;
    if (medicineFromProp) return medicineFromProp;
    return '등록된 투약 정보가 없어요';
  })();

  const medicineRowDanger = hasRecord && detailError;
  const medicineRowMuted =
    hasRecord && !detailError && (detailLoading || (!medicineFromApi && !medicineFromProp));
  const showSummaryCta = fromRecording || Boolean(detail?.hasAiSummary);

  const titleClass = fromRecording
    ? 'text-[18px] font-bold leading-none text-[#FF3D00]'
    : 'text-[18px] font-semibold leading-none text-[#8D8782]';

  return (
    <div className="-mt-3 mx-6 mb-4 rounded-[22px] border border-[#FFC721] bg-white px-5 pb-2 pt-4">
      <div className="flex min-h-[24px] items-start justify-between">
        <p
          className={`${titleClass} max-w-[70%] overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]`}
        >
          {label}
        </p>
        <p className="shrink-0 text-[15px] font-medium leading-none text-[#706963]">{time}</p>
      </div>

      {numericRecordId != null && detailLoading ? (
        <p className="mb-4 text-[12px] font-medium text-[#B9B2A6]">상세 정보를 불러오는 중…</p>
      ) : null}
      {numericRecordId != null && detailError ? (
        <p className="mb-4 text-[12px] font-medium text-[#C45C4A]">
          상세 정보를 불러오지 못했습니다. 목록에 표시된 내용만 보여요.
        </p>
      ) : null}

      <div className="mt-4 space-y-3">
        {displayLocation ? (
          <InfoItem
            icon={<PlaceIcon className="size-3 [&_path]:fill-[#AB4C0A]" />}
            text={displayLocation}
            recording={fromRecording}
          />
        ) : null}
        {displayChild ? (
          <InfoItem
            icon={<HumanIcon className="size-[10px] [&_path]:fill-[#AB4C0A]" />}
            text={displayChild}
            recording={fromRecording}
          />
        ) : null}
        {displayMemo ? (
          <InfoItem
            icon={<PencilIcon className="size-2.5 [&_path]:fill-[#AB4C0A]" />}
            text={displayMemo}
            recording={fromRecording}
          />
        ) : null}
        {showMedicineRow ? (
          <InfoItem
            icon={<MedicineIcon className="size-[9px] [&_path]:fill-[#AB4C0A]" />}
            text={medicineRowText}
            recording={fromRecording}
            highlight={
              !fromRecording &&
              Boolean(medicineFromApi || medicineFromProp) &&
              !medicineRowMuted &&
              !medicineRowDanger
            }
            muted={medicineRowMuted}
            danger={medicineRowDanger}
          />
        ) : null}
      </div>

      {showSummaryCta ? (
        <Button
          bgColor="#FFC721"
          textColor="#FFFFFF"
          onClick={() =>
            onViewSummary({
              childName: detail?.childName ?? displayChild,
              recordId: numericRecordId,
              scheduleTitle: label,
            })
          }
          className="mt-1 rounded-[14px] text-[18px] font-semibold leading-none"
        >
          진료 요약 보기
        </Button>
      ) : (
        <Button
          bgColor="#FFC721"
          textColor="#FFFFFF"
          onClick={() =>
            onAddRecording({
              recordId: numericRecordId,
              childId: detail?.childId ?? childId ?? null,
              childName: detail?.childName ?? displayChild ?? '',
              childLabelColor,
            })
          }
          className="mt-4 rounded-[14px] text-[18px] font-semibold leading-none"
        >
          일정에 녹음 추가하기
        </Button>
      )}
    </div>
  );
}
