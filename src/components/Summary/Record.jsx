import { useCallback, useEffect, useRef, useState } from 'react';

import { postAiSummary } from '@/api/aiSummary';
import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import CreateQuestionModal from '@/components/Question/CreateQuestionModal';
import RecordStop from '@/components/Summary/RecordStop';
import SummaryRecord from '@/components/Summary/SummaryRecord';
import BackButtonIcon from '@/components/common/BackButtonIcon';

const TOTAL_WAVE_BARS = 55;
const BASE_WAVE_HEIGHT = 6;

function formatElapsedTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safe / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatTreatDateYmd(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function recordIdFromAiSummaryResponse(data) {
  if (data == null || typeof data !== 'object') return null;
  const raw = data.recordId ?? data.id;
  if (raw == null || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

function RecordingWave({ isRecording, waveHeights = [], cursorIndex = 0 }) {
  const barWidth = 1.8;
  const barGap = 3;
  const waveAreaWidth = 264;
  const drawnBars = Math.min(cursorIndex, TOTAL_WAVE_BARS);
  const barsCount = drawnBars;
  const liveWaveWidth = barsCount > 0 ? barsCount * barWidth + (barsCount - 1) * barGap : 0;
  const cursorOffset = Math.max(2, liveWaveWidth);

  return (
    <div className="relative mt-8 h-[106px] overflow-hidden rounded-[62px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.08)]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex w-[264px] items-center">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: TOTAL_WAVE_BARS }).map((_, idx) => {
              const active = isRecording && idx < drawnBars;
              const height = active ? (waveHeights[idx] ?? BASE_WAVE_HEIGHT) : BASE_WAVE_HEIGHT;
              return (
                <span key={`bar-${idx}`} className="flex h-[40px] w-[1.8px] items-center">
                  <span
                    className={`w-[1.8px] rounded-full transition-[height,background-color] duration-150 ${
                      active ? 'bg-[#FF3D00]' : 'bg-[#B9B2A6]'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {isRecording ? (
        <>
          <div
            className="absolute top-4 h-[72px] w-[2px] bg-[#FF3D00]"
            style={{ left: `calc(50% - ${waveAreaWidth / 2}px + ${cursorOffset}px)` }}
          />
          <span
            className="absolute top-3 size-[7px] rounded-full bg-[#FF3D00]"
            style={{ left: `calc(50% - ${waveAreaWidth / 2}px + ${cursorOffset - 2.5}px)` }}
          />
        </>
      ) : null}
    </div>
  );
}

/**
 * 일정이 있는 경우: recordId + childId 로 POST /ai-summaries
 * 일정 없이 FAB: childId 만으로 POST → 서버가 의료 기록 생성 후 recordId 반환
 */
export default function Record({
  isOpen,
  childId = null,
  recordId = null,
  childName = '',
  childLabelColor = '#5AA7FF',
  /** true: 바텀시트 일정에서 들어온 경우(이미 recordId 있음). 요약 후 일정 추가 CTA 숨김 */
  openedWithScheduleRecord = false,
  recordingCellIndex = null,
  summaryDateText,
  onBack = () => {},
  onOpenScheduleFromSummary = () => {},
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [recordingCompletedAt, setRecordingCompletedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [micError, setMicError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [summaryRecordId, setSummaryRecordId] = useState(null);
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT)
  );
  const [cursorIndex, setCursorIndex] = useState(0);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioBlobRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);
  const frameCountRef = useRef(0);
  const cursorIndexRef = useRef(0);
  const smoothedAmplitudeRef = useRef(0);
  const summaryTimeoutRef = useRef(null);
  const uploadedAudioRef = useRef(false);
  const uploadPromiseRef = useRef(null);

  const stopRecorderAndGetBlob = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      return Promise.resolve(audioBlobRef.current);
    }

    return new Promise((resolve) => {
      recorder.addEventListener(
        'stop',
        () => {
          const chunks = audioChunksRef.current.filter((chunk) => chunk.size > 0);
          if (chunks.length === 0) {
            resolve(audioBlobRef.current);
            return;
          }
          const blob = new Blob(chunks, {
            type: chunks[0]?.type || recorder.mimeType || 'audio/webm',
          });
          audioBlobRef.current = blob;
          resolve(blob);
        },
        { once: true }
      );
      recorder.stop();
    });
  }, []);

  const stopMicrophone = useCallback(async () => {
    const blob = await stopRecorderAndGetBlob();
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    dataArrayRef.current = null;
    frameCountRef.current = 0;
    smoothedAmplitudeRef.current = 0;
    return blob;
  }, [stopRecorderAndGetBlob]);

  const clearSummaryTimeout = () => {
    if (summaryTimeoutRef.current) {
      window.clearTimeout(summaryTimeoutRef.current);
      summaryTimeoutRef.current = null;
    }
  };

  const animateWave = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;

    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
    let sumSquares = 0;
    for (let i = 0; i < dataArrayRef.current.length; i += 1) {
      const normalized = (dataArrayRef.current[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / dataArrayRef.current.length);
    const amplitude = Math.min(1, rms * 7.5);
    smoothedAmplitudeRef.current = smoothedAmplitudeRef.current * 0.55 + amplitude * 0.45;

    frameCountRef.current += 1;
    const writeIndex = Math.min(cursorIndexRef.current, TOTAL_WAVE_BARS - 1);
    if (frameCountRef.current % 3 === 0) {
      const nextHeight = 7 + Math.round(Math.pow(smoothedAmplitudeRef.current, 0.75) * 40);
      setWaveHeights((prev) => {
        const next = [...prev];
        next[writeIndex] = nextHeight;
        return next;
      });
    }

    if (frameCountRef.current % 30 === 0) {
      const nextHeight = 7 + Math.round(Math.pow(smoothedAmplitudeRef.current, 0.75) * 40);
      setWaveHeights((prev) => {
        const next = [...prev];
        next[writeIndex] = nextHeight;
        return next;
      });

      setCursorIndex((prev) => {
        const next = Math.min(TOTAL_WAVE_BARS, prev + 1);
        cursorIndexRef.current = next;
        return next;
      });
    }

    rafRef.current = window.requestAnimationFrame(animateWave);
  };

  const startMicrophone = async () => {
    try {
      setMicError('');
      setSummaryError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const MediaRecorderClass = window.MediaRecorder;
      if (!MediaRecorderClass) {
        throw new Error('MEDIA_RECORDER_UNSUPPORTED');
      }
      const recorder = new MediaRecorderClass(stream);
      mediaRecorderRef.current = recorder;
      recorder.addEventListener('dataavailable', (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      });
      recorder.start(250);

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error('AUDIO_CONTEXT_UNSUPPORTED');
      }

      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.55;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      dataArrayRef.current = dataArray;

      setIsRecording(true);
      animateWave();
    } catch (error) {
      if (error?.name === 'NotAllowedError') {
        setMicError('마이크 권한이 차단되어 있어요. 브라우저 설정에서 마이크를 허용해 주세요.');
      } else if (error?.name === 'NotFoundError') {
        setMicError('사용 가능한 마이크를 찾을 수 없어요.');
      } else if (error?.message === 'MEDIA_RECORDER_UNSUPPORTED') {
        setMicError('현재 브라우저는 음성 녹음 저장을 지원하지 않아요.');
      } else if (error?.message === 'AUDIO_CONTEXT_UNSUPPORTED') {
        setMicError('현재 브라우저는 오디오 분석을 지원하지 않아요.');
      } else {
        setMicError('마이크를 시작하지 못했어요. 브라우저를 새로고침 후 다시 시도해 주세요.');
      }
      await stopMicrophone();
      setIsRecording(false);
    }
  };

  const uploadRecordingAudio = useCallback(
    async (blob) => {
      if (uploadedAudioRef.current) return true;
      const hasRecordId = recordId != null && recordId !== '';
      if (!hasRecordId && !childId) {
        setSummaryError('아이 정보가 없어서 요약을 생성할 수 없어요. 다시 선택해 주세요.');
        return false;
      }
      if (!blob) {
        setSummaryError('녹음 파일을 찾지 못했어요. 다시 녹음해 주세요.');
        return false;
      }
      if (uploadPromiseRef.current) {
        return uploadPromiseRef.current;
      }

      setIsUploadingAudio(true);
      const pending = (async () => {
        try {
          const res = await postAiSummary({
            ...(hasRecordId
              ? { recordId }
              : { childId, treatDate: formatTreatDateYmd(new Date()) }),
            audioFile: blob,
            fileName: `recording-${Date.now()}.webm`,
          });
          uploadedAudioRef.current = true;
          const rid = recordIdFromAiSummaryResponse(res) ?? (hasRecordId ? Number(recordId) : null);
          if (rid != null) {
            setSummaryRecordId(rid);
          }
          return true;
        } catch (error) {
          const data = error?.response?.data;
          const msg =
            (typeof data?.message === 'string' && data.message) ||
            (typeof data === 'string' ? data : null) ||
            error?.message ||
            'AI 요약 생성에 실패했어요. 잠시 후 다시 시도해 주세요.';
          setSummaryError(msg);
          return false;
        } finally {
          uploadPromiseRef.current = null;
          setIsUploadingAudio(false);
        }
      })();
      uploadPromiseRef.current = pending;
      return pending;
    },
    [childId, recordId]
  );

  useEffect(() => {
    if (!isRecording || !isOpen) return undefined;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording, isOpen]);

  useEffect(
    () => () => {
      void stopMicrophone();
      clearSummaryTimeout();
    },
    [stopMicrophone]
  );

  if (!isOpen) return null;

  const handleBack = () => {
    void stopMicrophone();
    setIsRecording(false);
    setIsStopped(false);
    setElapsedSeconds(0);
    setWaveHeights(Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT));
    setCursorIndex(0);
    cursorIndexRef.current = 0;
    setIsSummaryOpen(false);
    setIsSummaryModalOpen(false);
    setSummaryError('');
    setRecordingCompletedAt(null);
    setSummaryRecordId(null);
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    uploadedAudioRef.current = false;
    uploadPromiseRef.current = null;
    clearSummaryTimeout();
    onBack();
  };

  const openSummaryModal = async () => {
    setSummaryError('');
    setIsSummarizing(true);
    const blob = isRecording ? await stopMicrophone() : audioBlobRef.current;
    setIsRecording(false);
    const uploaded = await uploadRecordingAudio(blob);
    if (!uploaded) {
      setIsSummarizing(false);
      return;
    }
    setIsStopped(true);
    setRecordingCompletedAt(new Date());
    setIsSummaryModalOpen(true);
    clearSummaryTimeout();
    summaryTimeoutRef.current = window.setTimeout(() => {
      setIsSummaryModalOpen(false);
      setIsSummaryOpen(true);
      setIsSummarizing(false);
    }, 1300);
  };

  const displayRecordIdForSummary =
    summaryRecordId ??
    (recordId != null &&
    recordId !== '' &&
    Number.isFinite(Number(recordId)) &&
    Number(recordId) >= 1
      ? Number(recordId)
      : null);

  return (
    <div className="fixed inset-0 z-[90] bg-[#FFFFFF]">
      <div className="mx-auto flex h-full w-full max-w-112.5 flex-col overflow-y-auto bg-[#FFFFFF]">
        <header className="flex items-center gap-5 bg-white px-6 pt-10 pb-7">
          <button type="button" onClick={handleBack} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
          <p className="text-[18px] font-medium tracking-[-0.72px] text-[#706963]">{childName}</p>
        </header>

        <section className="px-5 pt-8">
          <div className="flex justify-center">
            <div
              className={`inline-flex items-center gap-[6px] rounded-[6.214px] px-[13px] py-[6px] text-[12px] ${
                isRecording ? 'bg-[#FAF7F2] text-[#706963]' : 'bg-[#706963] text-[#FFFCF9]'
              }`}
            >
              {isRecording ? <span className="size-[6px] rounded-full bg-[#706963]" /> : null}
              {isRecording ? '녹음을 진행하고 있어요!' : '녹음 대기 중'}
            </div>
          </div>
          <p className="mt-5 text-center text-[48px] font-bold text-[#17171B]">
            {formatElapsedTime(elapsedSeconds)}
          </p>

          <RecordingWave
            isRecording={isRecording}
            waveHeights={waveHeights}
            cursorIndex={cursorIndex}
          />

          <button
            type="button"
            onClick={async () => {
              if (isRecording) {
                setSummaryError('');
                const blob = await stopMicrophone();
                setIsRecording(false);
                setIsStopped(true);
                void uploadRecordingAudio(blob);
                return;
              }
              audioChunksRef.current = [];
              audioBlobRef.current = null;
              uploadedAudioRef.current = false;
              uploadPromiseRef.current = null;
              const resetBars = Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT);
              setWaveHeights(resetBars);
              setCursorIndex(0);
              cursorIndexRef.current = 0;
              setIsStopped(false);
              await startMicrophone();
            }}
            className={`mt-10 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] text-[18px] font-semibold ${
              isRecording
                ? 'bg-[#C91100] text-[#F0F2F5]'
                : 'border border-[#FF3D00] bg-[#FAF7F2] text-[#FF3D00]'
            }`}
          >
            <MicrophoneIcon
              className={`size-6 [&_rect]:fill-transparent ${
                isRecording ? '[&_path]:stroke-[#F0F2F5]' : '[&_path]:stroke-[#FF3D00]'
              }`}
            />
            {isRecording ? '녹음 멈추기' : '녹음 시작하기'}
          </button>

          <button
            type="button"
            onClick={() => {
              void stopMicrophone();
              setElapsedSeconds(0);
              setIsRecording(false);
              setIsStopped(false);
              setSummaryError('');
              audioChunksRef.current = [];
              audioBlobRef.current = null;
              uploadedAudioRef.current = false;
              uploadPromiseRef.current = null;
              const resetBars = Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT);
              setWaveHeights(resetBars);
              setCursorIndex(0);
              cursorIndexRef.current = 0;
            }}
            className={`mt-3 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] text-[18px] font-semibold ${
              isRecording ? 'bg-[#FFD4C7] text-[#FF3D00]' : 'bg-[#B9B2A6] text-[#FAF7F2]'
            }`}
          >
            <MicrophoneIcon
              className={`size-6 [&_rect]:fill-transparent ${
                isRecording ? '[&_path]:stroke-[#FF3D00]' : '[&_path]:stroke-[#FAF7F2]'
              }`}
            />
            녹음 다시 하기
          </button>
          {micError ? <p className="mt-3 text-center text-sm text-[#FF3D00]">{micError}</p> : null}
        </section>

        <div className="mt-6 h-4 w-full bg-[#E3E6EA]" />

        <section className="bg-white px-6 pt-8 pb-6">
          <p className="text-[16px] font-medium text-[#667085]">설명이 끝났나요?</p>
          <p className="mt-1 text-[18px] font-bold text-black">바로 AI 요약 기능을 활용해봐요</p>
          <button
            type="button"
            disabled={isSummarizing || isUploadingAudio}
            onClick={() => void openSummaryModal()}
            className="mt-9 h-[52px] w-full rounded-[12px] bg-[#B9B2A6] text-[18px] font-semibold text-[#FAF7F2] disabled:opacity-60"
          >
            {isUploadingAudio
              ? '녹음 파일 전송 중...'
              : isSummarizing
                ? '요약 생성 중...'
                : '의사 선생님 말씀 정리하기'}
          </button>
          {summaryError ? (
            <p className="mt-3 text-center text-sm text-[#FF3D00]">{summaryError}</p>
          ) : null}
        </section>
      </div>

      <RecordStop
        isOpen={isStopped}
        childName={childName}
        elapsedSeconds={elapsedSeconds}
        waveHeights={waveHeights}
        cursorIndex={cursorIndex}
        totalBars={TOTAL_WAVE_BARS}
        baseHeight={BASE_WAVE_HEIGHT}
        onBack={handleBack}
        onResume={async () => {
          setIsStopped(false);
          uploadedAudioRef.current = false;
          uploadPromiseRef.current = null;
          await startMicrophone();
        }}
        onRetry={() => {
          void stopMicrophone();
          setIsRecording(false);
          setIsStopped(false);
          setElapsedSeconds(0);
          setSummaryError('');
          audioChunksRef.current = [];
          audioBlobRef.current = null;
          uploadedAudioRef.current = false;
          uploadPromiseRef.current = null;
          setWaveHeights(Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT));
          setCursorIndex(0);
          cursorIndexRef.current = 0;
        }}
        onSummarize={() => void openSummaryModal()}
      />

      {isSummaryModalOpen ? (
        <div className="absolute inset-0 z-[120] flex items-center justify-center bg-black/40 px-6">
          <CreateQuestionModal
            onClose={() => {
              setIsSummaryModalOpen(false);
              clearSummaryTimeout();
            }}
            title={'잠시만 기다려 주세요\n지금 AI가 대화를 요약하고 있어요'}
            description={'녹음 내용은 제 3자에게 전달되지 않고\n요약 후 즉시 삭제돼요'}
          />
        </div>
      ) : null}

      {isSummaryOpen && displayRecordIdForSummary != null ? (
        <SummaryRecord
          childName={childName}
          childLabelColor={childLabelColor}
          summaryDateText={summaryDateText}
          recordId={displayRecordIdForSummary}
          scheduleTitle=""
          hideScheduleCta={openedWithScheduleRecord}
          onBack={handleBack}
          onGoToSchedule={() => {
            const completedAt = recordingCompletedAt ?? new Date();
            onOpenScheduleFromSummary({
              completedAt,
              cellIndex:
                recordingCellIndex != null && recordingCellIndex >= 0 ? recordingCellIndex : null,
              recordId: displayRecordIdForSummary,
            });
          }}
        />
      ) : null}
    </div>
  );
}
