import Button from '@/components/common/Button';

function EndIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="#B9B2A6" strokeWidth="1.2" />
      <path
        d="M4.5 4.5L9.5 9.5M9.5 4.5L4.5 9.5"
        stroke="#B9B2A6"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SettingModal({
  onClose,
  children,
  actionLabel,
  actionIcon,
  actionPressedIcon,
  actionPressedBgColor = '#E28702',
  actionPressedTextColor = '#F5DF7A',
  onAction,
  actionDisabled = false,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-84.25 overflow-hidden rounded-[23px] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-5 pt-4.5 pb-3.25"
        >
          <EndIcon />
          <span className="text-[18px] font-medium tracking-[-0.45px] text-[#B9B2A6]">끝내기</span>
        </button>
        <div className="border-t-[1.5px] border-[#FAF7F2]" />

        <div className="flex flex-col px-5 pt-5 pb-5">
          {children}

          {actionLabel && (
            <div className="mt-6">
              <Button
                onClick={onAction}
                disabled={actionDisabled}
                icon={actionIcon}
                pressedIcon={actionPressedIcon}
                bgColor={actionDisabled ? '#B9B2A6' : '#FFC721'}
                textColor="#FFFCF9"
                pressedBgColor={actionDisabled ? undefined : actionPressedBgColor}
                pressedTextColor={actionDisabled ? undefined : actionPressedTextColor}
              >
                {actionLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
