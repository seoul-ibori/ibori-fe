function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        d="M3 7.5l3 3 5-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckBox({ checked, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      role="checkbox"
      aria-checked={checked}
      className={`mt-[3px] flex size-[17.561px] shrink-0 items-center justify-center rounded-[4.39px] ${
        checked ? 'bg-[#FFC721]' : 'border border-[#A8A19A] bg-white'
      } ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      {checked && <CheckIcon className="size-[14.049px]" />}
    </button>
  );
}

export default function QuestionBox({
  title = '우리 아이의 질문지',
  questions,
  editable = false,
  onToggle,
}) {
  return (
    <div className="rounded-[17.561px] bg-[#FAF7F2] p-[3px] drop-shadow-[0px_1.463px_2.927px_rgba(0,42,70,0.1)]">
      <div className="rounded-[14.634px] bg-white px-[17.561px] py-[14.634px]">
        <p className="text-[18px] leading-[26.342px] font-bold tracking-[-0.7317px] text-[#1D1B1A]">
          {title}
        </p>
      </div>
      <div className="flex flex-col gap-7.5 px-5 pt-7 pb-7">
        {questions.map((q) => (
          <div key={q.id} className="flex items-start gap-[12px]">
            <CheckBox
              checked={q.checked}
              onClick={() => editable && onToggle?.(q.id)}
              disabled={!editable}
            />
            <p className="flex-1 text-[16px] leading-[23.415px] font-medium tracking-[-0.3659px] whitespace-pre-line text-[#706963]">
              {q.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
