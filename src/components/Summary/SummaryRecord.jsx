import { useMemo, useState } from 'react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { deleteAiSummary, getAiSummary } from '@/api/aiSummary';
import DoctorIcon from '@/assets/icons/summary/doctor.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';
import SummaryDeleteConfirmModal from '@/components/Summary/SummaryDeleteConfirmModal';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';

const DUMMY_SUMMARY = {
  dateText: '2026년 4월 10일',
  heading: '진료 내역 전달해드려요',
  oneLine: '예방접종으로 인해 미열이 날 수 있어 지켜보고, 다음 접종은 4주 뒤예요',
  noteTitle: '민준 예방접종',
  relationLabel: '아빠',
  sections: [
    {
      title: '진료 요약',
      lines: ['DTaP(디프테리아/파상풍/백일해) 예방접종 완료', '접종 후 2~3일 정도 미열 가능'],
    },
    {
      title: '주의사항',
      lines: ['열이 나면 해열제 복용 가능', '접종 부위 붓거나 아플 수 있음 (자연스러운 반응)'],
    },
    {
      title: '다음 일정',
      lines: ['4주 뒤 추가 접종 필요'],
    },
  ],
};

function textToLines(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  return String(value)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function sectionsFromApi(api) {
  if (!api || typeof api !== 'object') return [];
  const sections = [];
  const medicalLines = textToLines(api.medicalSummary);
  if (medicalLines.length) sections.push({ title: '진료 요약', lines: medicalLines });
  const cautionLines = textToLines(api.caution);
  if (cautionLines.length) sections.push({ title: '주의사항', lines: cautionLines });
  const nextLines = textToLines(api.nextSchedule);
  if (nextLines.length) sections.push({ title: '다음 일정', lines: nextLines });
  if (sections.length === 0) {
    sections.push({ title: '진료 요약', lines: ['표시할 요약 문장이 없습니다.'] });
  }
  return sections;
}

function SectionBlock({ title, lines }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-[#FFC721] text-[12px] font-bold text-[#5F3010]">
          ✓
        </span>
        <p className="text-[16px] leading-none font-bold tracking-[-0.36px] text-[#1D1B1A]">
          {title}
        </p>
      </div>
      <div className="mt-3 space-y-2 pl-[30px]">
        {lines.map((line, i) => (
          <p
            key={`${title}-${i}-${line}`}
            className="text-[15px] leading-[1.55] font-medium tracking-[-0.36px] text-[#706963]"
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function SummaryRecord({
  childName = '우리집 아들',
  childLabelColor = '#5AA7FF',
  summaryDateText,
  recordId = null,
  scheduleTitle = '',
  hideScheduleCta = false,
  allowSummaryDelete = false,
  onBack = () => {},
  onGoToSchedule = () => {},
  onConfirmDeleteSummary = () => {},
}) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const numericRecordId = useMemo(() => {
    if (recordId == null || recordId === '') return null;
    const n = Number(recordId);
    return Number.isFinite(n) && n >= 1 ? n : null;
  }, [recordId]);

  const useLiveSummary = numericRecordId != null;

  const {
    data: apiSummary,
    isLoading: summaryLoading,
    isError: summaryError,
    error: summaryErrorObj,
  } = useQuery({
    queryKey: ['aiSummary', numericRecordId],
    queryFn: () => getAiSummary(numericRecordId),
    enabled: useLiveSummary,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAiSummary(numericRecordId),
    onSuccess: () => {
      setDeleteModalOpen(false);
      if (numericRecordId != null) {
        queryClient.invalidateQueries({ queryKey: ['medicalRecord', 'detail', numericRecordId] });
      }
      queryClient.removeQueries({ queryKey: ['aiSummary', numericRecordId] });
      onConfirmDeleteSummary();
    },
    onError: (err) => {
      const data = err?.response?.data;
      const msg =
        (typeof data?.message === 'string' && data.message) ||
        (typeof data === 'string' ? data : null) ||
        err?.message ||
        '삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';
      window.alert(msg);
    },
  });

  const display = useMemo(() => {
    if (!useLiveSummary) {
      return {
        source: 'dummy',
        heading: DUMMY_SUMMARY.heading,
        oneLine: DUMMY_SUMMARY.oneLine,
        noteTitle: DUMMY_SUMMARY.noteTitle,
        showLocationHint: true,
        relationLabel: DUMMY_SUMMARY.relationLabel,
        sections: DUMMY_SUMMARY.sections,
      };
    }
    const raw = apiSummary && typeof apiSummary === 'object' ? apiSummary : null;
    const oneLine =
      (raw?.oneLineSummary && String(raw.oneLineSummary).trim()) ||
      '한 줄 요약을 불러오지 못했습니다.';
    const title = (scheduleTitle && String(scheduleTitle).trim()) || childName || '진료 요약';
    return {
      source: 'api',
      heading: '진료 내역 전달해드려요',
      oneLine,
      noteTitle: title,
      showLocationHint: false,
      relationLabel: null,
      sections: sectionsFromApi(raw),
    };
  }, [apiSummary, childName, scheduleTitle, useLiveSummary]);

  const dateHeading =
    summaryDateText && String(summaryDateText).trim()
      ? String(summaryDateText).trim()
      : DUMMY_SUMMARY.dateText;

  const errMessage =
    summaryErrorObj?.response?.data?.message ||
    summaryErrorObj?.message ||
    '요약을 불러오지 못했습니다.';

  return (
    <div className="fixed inset-0 z-[130] overflow-y-auto bg-[#FFFFFF]">
      <div className="mx-auto min-h-full w-full max-w-112.5 bg-[#FFFFFF] pb-8">
        <header className="flex items-start justify-between px-6 pt-10">
          <button type="button" onClick={onBack} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
          {allowSummaryDelete ? (
            <button
              type="button"
              aria-label="AI 요약본 삭제"
              onClick={() => setDeleteModalOpen(true)}
              className="flex size-10 shrink-0 items-center justify-center rounded-[8.5px] bg-[#FFC721]"
            >
              <TrashIcon className="size-4 [&_path]:fill-[#AB4C0A]" />
            </button>
          ) : null}
        </header>

        {useLiveSummary && summaryLoading ? (
          <p className="mt-12 px-6 text-center text-[15px] font-medium text-[#706963]">
            AI 요약을 불러오는 중…
          </p>
        ) : null}

        {useLiveSummary && summaryError ? (
          <div className="mt-12 px-6 text-center">
            <p className="text-[15px] font-medium text-[#C45C4A]">{errMessage}</p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 text-[15px] font-semibold text-[#706963] underline"
            >
              돌아가기
            </button>
          </div>
        ) : null}

        {(!useLiveSummary || (!summaryLoading && !summaryError)) && (
          <>
            <section className="mt-8 flex flex-col items-center px-6 text-center">
              <ChildrenImgBox
                labelColor={childLabelColor}
                selected
                className="h-[133px] w-[133px] rounded-[43px]"
                shadowClassName="shadow-[inset_0px_11px_6px_0px_rgba(255,255,255,0.2)]"
              />
              <span
                className="-mt-3 rounded-[8px] ml-[6rem] mt-[-1rem] px-3 py-1 text-[17px] font-medium tracking-[-0.68px] text-[#FFFCF9] z-[10]"
                style={{ backgroundColor: childLabelColor }}
              >
                {childName}
              </span>
              <p className="mt-6 text-[12px] font-medium text-[#706963]">
                AI가 진료 내용을 정리했어요
              </p>
              <p className="mt-3 text-[26px] leading-[1.35] font-extrabold tracking-[-0.32px] text-[#1D1B1A]">
                {dateHeading}
                <br />
                {display.heading}
              </p>
            </section>

            <div className="mt-8 h-3.5 w-full bg-[#FAF7F2]" />

            <section className="bg-[#FFFFFF] px-5 py-5">
              <div className="flex items-center gap-4 rounded-[16px] bg-[#FFFFFF] p-3">
                <div className="h-[55px] w-[55px] shrink-0 mr-[0.1rem] ml-[-1rem]">
                  <DoctorIcon className="h-full w-full" />
                </div>
                <div>
                  <div className="mt-[-0.5rem]">
                    <p className="text-[15px] font-medium text-[#706963]">AI의 한 줄 요약</p>
                  </div>
                  <p className="mt-1 text-[18px] leading-[1.25] font-bold text-[#1D1B1A]">
                    {display.oneLine}
                  </p>
                </div>
              </div>
            </section>

            <div className="h-3.5 w-full bg-[#FAF7F2]" />

            <section className="px-5 pt-6">
              <p className="text-[15px] font-medium text-[#706963]">AI 녹취록 기반 정리</p>
              <p className="mt-1 text-[18px] leading-[1.2] font-bold text-[#1D1B1A]">
                이렇게 정리했어요!
              </p>

              <div className="mt-4 rounded-[17px] bg-[#FAF7F2] pb-3 shadow-[0_1.4px_2.9px_rgba(0,42,70,0.1)]">
                <div className="rounded-[15px] bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[18px] font-bold tracking-[-0.73px] text-[#1D1B1A]">
                        {display.noteTitle}
                      </p>
                      {display.showLocationHint ? (
                        <p className="mt-1 text-[15px] font-medium tracking-[-0.36px] text-[#FF3D00]">
                          *위치를 입력해주세요
                        </p>
                      ) : null}
                    </div>
                    {display.relationLabel ? (
                      <span className="rounded-full bg-[#556FFF] px-4 py-1 text-[13px] font-medium text-white">
                        {display.relationLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                {display.sections.map((section, si) => (
                  <SectionBlock
                    key={`${section.title}-${si}`}
                    title={section.title}
                    lines={section.lines}
                  />
                ))}
              </div>
            </section>

            {hideScheduleCta ? null : (
              <div className="mt-6 px-5 pb-6">
                <Button onClick={onGoToSchedule} bgColor="#FFC721" textColor="#FFFFFF">
                  위치 입력 후 저장하기
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <SummaryDeleteConfirmModal
        open={deleteModalOpen}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setDeleteModalOpen(false);
        }}
        onConfirmDelete={() => {
          if (!numericRecordId || deleteMutation.isPending) return;
          deleteMutation.mutate();
        }}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
