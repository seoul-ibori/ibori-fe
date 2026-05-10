import { useEffect, useRef, useState } from 'react';

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

export default function Record({
  isOpen,
  childName = '',
  childLabelColor = '#5AA7FF',
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
  const [waveHeights, setWaveHeights] = useState(() =>
    Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT)
  );
  const [cursorIndex, setCursorIndex] = useState(0);

  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const rafRef = useRef(null);
  const frameCountRef = useRef(0);
  const cursorIndexRef = useRef(0);
  const smoothedAmplitudeRef = useRef(0);
  const summaryTimeoutRef = useRef(null);

  const stopMicrophone = () => {
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
  };

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

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

      // 버튼 상태를 즉시 반영해서 모바일에서도 활성화가 늦지 않게 합니다.
      setIsRecording(true);
      animateWave();
    } catch (error) {
      if (error?.name === 'NotAllowedError') {
        setMicError('마이크 권한이 차단되어 있어요. 브라우저 설정에서 마이크를 허용해 주세요.');
      } else if (error?.name === 'NotFoundError') {
        setMicError('사용 가능한 마이크를 찾을 수 없어요.');
      } else if (error?.message === 'AUDIO_CONTEXT_UNSUPPORTED') {
        setMicError('현재 브라우저는 오디오 분석을 지원하지 않아요.');
      } else {
        setMicError('마이크를 시작하지 못했어요. 브라우저를 새로고침 후 다시 시도해 주세요.');
      }
      stopMicrophone();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (!isRecording || !isOpen) return undefined;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isRecording, isOpen]);

  useEffect(
    () => () => {
      stopMicrophone();
      clearSummaryTimeout();
    },
    []
  );

  if (!isOpen) return null;

  const handleBack = () => {
    stopMicrophone();
    setIsRecording(false);
    setIsStopped(false);
    setElapsedSeconds(0);
    setWaveHeights(Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT));
    setCursorIndex(0);
    cursorIndexRef.current = 0;
    setIsSummaryOpen(false);
    setIsSummaryModalOpen(false);
    setRecordingCompletedAt(null);
    clearSummaryTimeout();
    onBack();
  };

  const openSummaryModal = () => {
    setRecordingCompletedAt(new Date());
    stopMicrophone();
    setIsRecording(false);
    setIsStopped(true);
    setIsSummaryModalOpen(true);
    clearSummaryTimeout();
    summaryTimeoutRef.current = window.setTimeout(() => {
      setIsSummaryModalOpen(false);
      setIsSummaryOpen(true);
    }, 1300);
  };

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
                stopMicrophone();
                setIsRecording(false);
                setIsStopped(true);
                return;
              }
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
              stopMicrophone();
              setElapsedSeconds(0);
              setIsRecording(false);
              setIsStopped(false);
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
            onClick={openSummaryModal}
            className="mt-9 h-[52px] w-full rounded-[12px] bg-[#B9B2A6] text-[18px] font-semibold text-[#FAF7F2]"
          >
            의사 선생님 말씀 정리하기
          </button>
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
          await startMicrophone();
        }}
        onRetry={() => {
          stopMicrophone();
          setIsRecording(false);
          setIsStopped(false);
          setElapsedSeconds(0);
          setWaveHeights(Array.from({ length: TOTAL_WAVE_BARS }, () => BASE_WAVE_HEIGHT));
          setCursorIndex(0);
          cursorIndexRef.current = 0;
        }}
        onSummarize={openSummaryModal}
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

      {isSummaryOpen ? (
        <SummaryRecord
          childName={childName}
          childLabelColor={childLabelColor}
          summaryDateText={summaryDateText}
          onBack={() => setIsSummaryOpen(false)}
          onGoToSchedule={() => {
            if (
              recordingCompletedAt == null ||
              recordingCellIndex == null ||
              recordingCellIndex < 0
            ) {
              return;
            }
            onOpenScheduleFromSummary({
              completedAt: recordingCompletedAt,
              cellIndex: recordingCellIndex,
            });
          }}
        />
      ) : null}
    </div>
  );
}
