import MedicalRecordIcon from '@/assets/icons/main/medical_record_icon.svg?react';
import PillIcon from '@/assets/icons/pill_icon.svg?react';

export default function MedicalRecord({ hospitalName, medicineName, date, category }) {
  return (
    <div className="flex items-center">
      <div className="flex h-26.25 w-24.25 shrink-0 items-center justify-center">
        <MedicalRecordIcon />
      </div>
      <div className="flex h-26.25 flex-1 flex-col justify-center gap-1.5 border-b border-[#FAF7F2]">
        <p className="text-[15px] font-semibold tracking-[-0.375px] text-[#413B32]">
          {hospitalName}
        </p>
        <div className="flex items-center gap-1.25">
          <PillIcon className="size-4.5 shrink-0" />
          <p className="whitespace-nowrap text-[15px] font-bold text-[#AB4C0A]">{medicineName}</p>
        </div>
        <div className="flex items-center gap-2.75 text-[12px] font-medium">
          <p className="text-[#B9B2A6]">{date}</p>
          <p className="text-[#FFC721]">{category}</p>
        </div>
      </div>
    </div>
  );
}
