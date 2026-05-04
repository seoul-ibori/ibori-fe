import hospitalBackgroundImg from '@/assets/images/main/hospital_background_image.png';
import HospitalImage from '@/assets/images/main/hospital_image.svg?react';

export default function AICreateQuestion() {
  return (
    <button
      type="button"
      className="relative w-full h-28.75 overflow-hidden rounded-[21px] bg-[#FFC721]"
    >
      <img
        src={hospitalBackgroundImg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-multiply"
      />

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-9.25 bg-gradient-to-r from-[#FAF7F2] from-[45%] to-[#F5DF7A]" />

      <HospitalImage className="absolute left-4.75 top-5 h-19.5 w-auto z-10" />

      <svg
        viewBox="0 0 8 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute right-4.5 top-1/2 z-10 h-4 w-2 -translate-y-1/2 text-white"
      >
        <path d="M1 1l6 7-6 7" />
      </svg>
    </button>
  );
}
