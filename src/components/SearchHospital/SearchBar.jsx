import ArrowLeftIcon from '@/assets/icons/arrow_left_icon.svg?react';
import SearchIcon from '@/assets/icons/searchHospital/search_icon.svg?react';

export default function SearchBar({ value, onChange, onSubmit, focused = false, onFocusChange }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className="flex h-12.25 w-full items-center gap-3.25 rounded-full bg-white px-4 shadow-[0_2px_8px_1px_#dce0e7]"
    >
      {focused ? (
        <button
          type="button"
          onClick={() => onFocusChange?.(false)}
          aria-label="뒤로"
          className="-ml-1 shrink-0"
        >
          <ArrowLeftIcon className="size-5.5" />
        </button>
      ) : (
        <>
          <span className="shrink-0 text-[15px] font-semibold tracking-[-0.375px] text-[#b9b2a6]">
            위치
          </span>
          <span className="h-6.25 w-px shrink-0 bg-[#e5e5e5]" />
        </>
      )}
      <input
        value={value ?? ''}
        onChange={onChange}
        onFocus={() => onFocusChange?.(true)}
        placeholder="위치를 입력해 주세요."
        className="min-w-0 flex-1 bg-transparent text-[15px] font-medium tracking-[-0.375px] text-[#3d3835] outline-none placeholder:text-[#3d38356b]"
      />
      <button type="submit" aria-label="검색" className="shrink-0">
        <SearchIcon className="size-7" />
      </button>
    </form>
  );
}
