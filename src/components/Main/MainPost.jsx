import FamilyIcon from '@/assets/icons/main/family_icon.svg?react';
import PlusBrownIcon from '@/assets/icons/main/plus_brown_icon.svg?react';
import familyBackgroundImg from '@/assets/images/main/family_background_img.png';

export default function MainPost() {
  return (
    <article className="relative overflow-hidden rounded-[35px] border border-[#FAF7F2] bg-white shadow-[0_1px_6px_rgba(226,135,2,0.15)]">
      <img
        src={familyBackgroundImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover mix-blend-multiply"
      />

      <div className="relative flex flex-col items-center px-5 pt-8.75 pb-5">
        <span className="rounded-md bg-[#FFC721] px-3.25 py-1.75 text-xs font-medium text-[#FFFCF9]">
          우리 가족 건강 파트너 AI
        </span>

        <h2 className="mt-2.25 text-center text-[27px] font-bold leading-9 tracking-[-0.27px] text-[#FFC721]">
          진료 기록은 AI에게
          <br />
          <span className="font-extrabold">우리 아이 건강은 한눈에!</span>
        </h2>

        <FamilyIcon className="mt-4 w-[60%] max-w-57.5" />

        <button
          type="button"
          className="mt-2 flex items-center gap-px self-end text-base font-medium text-[#5F3010]"
        >
          보러가기
          <PlusBrownIcon className="size-4.75" />
        </button>
      </div>
    </article>
  );
}
