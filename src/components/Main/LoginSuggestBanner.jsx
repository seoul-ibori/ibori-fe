import LoginSuggestIcon from '@/assets/icons/main/login_suggest_icon.svg?react';

export default function LoginSuggestBanner() {
  return (
    <div className="flex  gap-4 py-6 pl-6 w-full items-center">
      <LoginSuggestIcon className="size-12.75 shrink-0" />
      <div className="flex flex-col gap-1.25">
        <p className="text-[15px] font-medium text-[#7D7D7D]">반가워요!</p>
        <p className="text-[18px] font-bold text-[#413B32] leading-5.5">
          더 많은 서비스는
          <br />
          로그인 후 이용해 주세요
        </p>
      </div>
    </div>
  );
}
