import CancelIcon from '@/assets/icons/cancel_button_icon.svg?react';
import RecordTrashIcon from '@/assets/icons/record-trash.svg?react';

export default function SummaryDeleteConfirmModal({
  open,
  onClose,
  onConfirmDelete,
  isDeleting = false,
}) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 px-5"
      onClick={() => {
        if (isDeleting) return;
        onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-delete-heading"
        className="w-full max-w-[341px] overflow-hidden rounded-[23px] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (isDeleting) return;
              onClose();
            }}
            className="flex items-center gap-2 disabled:opacity-50"
          >
            <CancelIcon />
            <span className="text-[18px] font-medium tracking-[-0.45px] text-[#B9B2A6]">
              끝내기
            </span>
          </button>
          <div className="mt-2.5 h-px bg-[#EBE4D9]" />
        </div>

        <div className="flex flex-col items-center px-6 pt-6 pb-2">
          <RecordTrashIcon className="size-[52px] shrink-0 " aria-hidden />
          <p
            id="summary-delete-heading"
            className="mt-5 text-center text-[17px] font-medium text-[#706963]"
          >
            생성한 AI 요약본을
          </p>
          <p className="mt-1 text-center text-[18px] font-bold leading-snug text-[#1D1B1A]">
            정말로 삭제하시겠나요?
          </p>
        </div>

        <div className="flex gap-2 px-5 pb-5 pt-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              onConfirmDelete();
            }}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-[#B9B2A6] text-[16px] font-semibold leading-none text-white disabled:opacity-60"
          >
            {isDeleting ? '삭제 중…' : '지우기'}
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => {
              if (isDeleting) return;
              onClose();
            }}
            className="flex h-12 flex-1 items-center justify-center rounded-[10px] bg-[#FFC721] text-[16px] font-semibold leading-none text-white disabled:opacity-60"
          >
            돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
