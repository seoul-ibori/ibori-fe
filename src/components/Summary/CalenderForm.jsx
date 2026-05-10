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
  iconLift = 'none',
  rowNudgeDown = false,
}) {
  const textClass = recording
    ? 'text-[12px] font-semibold leading-none text-[#FF3D00]'
    : highlight
      ? 'text-[12px] font-semibold leading-none text-[#E28702]'
      : 'text-[12px] font-medium leading-none text-[#706963]';

  const isPillRow = iconLift === 'pill';
  const rowLiftClass = isPillRow ? '-translate-y-2.5' : '';
  const rowDownClass = rowNudgeDown ? 'translate-y-1' : '';
  const iconOnlyLiftClass = !isPillRow && recording && !rowNudgeDown ? '-translate-y-0.5' : '';

  return (
    <div className={`flex items-center gap-3 ${rowLiftClass} ${rowDownClass}`}>
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-[#FFC721] ${iconOnlyLiftClass}`}
      >
        {icon}
      </span>
      <p className={textClass}>{text}</p>
    </div>
  );
}

export default function CalenderForm({
  label,
  time,
  location,
  memo,
  childDisplayName = '',
  fromRecording = false,
  medicineText = '항노르디젠 화이트정10mg',
  onViewSummary = () => {},
  onAddRecording = () => {},
}) {
  const titleClass = fromRecording
    ? 'text-[18px] font-bold leading-none text-[#FF3D00]'
    : 'text-[18px] font-semibold leading-none text-[#8D8782]';

  return (
    <div className="mx-6 mb-4 rounded-[22px] border border-[#FFC721] bg-white px-5 pb-5 pt-7">
      <div className={`flex items-center justify-between ${fromRecording ? 'mb-6' : 'mb-8'}`}>
        <p className={titleClass}>{label}</p>
        <p className="text-[15px] font-medium leading-none text-[#706963]">{time}</p>
      </div>

      <div className={`space-y-4 ${fromRecording ? '-mt-1' : ''}`}>
        <InfoItem
          icon={<PlaceIcon className="size-3 [&_path]:fill-[#AB4C0A]" />}
          text={location || '-'}
          recording={fromRecording}
          rowNudgeDown={fromRecording}
        />
        {childDisplayName ? (
          <div className="pt-1">
            {fromRecording ? (
              <InfoItem
                icon={<HumanIcon className="size-[10px] [&_path]:fill-[#AB4C0A]" />}
                text={childDisplayName}
                recording={fromRecording}
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="size-6 shrink-0" aria-hidden />
                <p className="text-[12px] font-medium leading-none text-[#706963]">
                  {childDisplayName}
                </p>
              </div>
            )}
          </div>
        ) : null}
        {memo?.trim() ? (
          <InfoItem
            icon={<PencilIcon className="size-2.5 [&_path]:fill-[#AB4C0A]" />}
            text={memo}
            recording={fromRecording}
          />
        ) : null}
        <InfoItem
          icon={<MedicineIcon className="size-[9px] [&_path]:fill-[#AB4C0A]" />}
          text={medicineText}
          recording={fromRecording}
          highlight={!fromRecording}
          iconLift="pill"
        />
      </div>

      {fromRecording ? (
        <Button
          bgColor="#FFC721"
          textColor="#FFFFFF"
          onClick={onViewSummary}
          className="mt-6 rounded-[14px] text-[18px] font-semibold leading-none"
        >
          진료 요약 보기
        </Button>
      ) : (
        <Button
          bgColor="#FFC721"
          textColor="#FFFFFF"
          onClick={onAddRecording}
          className="mt-10 rounded-[14px] text-[18px] font-semibold leading-none"
        >
          일정에 녹음 추가하기
        </Button>
      )}
    </div>
  );
}
