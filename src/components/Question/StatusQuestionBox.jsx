import StatusBox from '@/components/Question/StatusBox';

export default function StatusQuestionBox({
  question,
  required = false,
  options,
  multiple = false,
  value,
  onChange,
  children,
}) {
  const handleSelect = (option) => {
    if (multiple) {
      const next = value.includes(option) ? value.filter((v) => v !== option) : [...value, option];
      onChange(next);
      return;
    }
    onChange(option);
  };

  const isSelected = (option) => (multiple ? value.includes(option) : value === option);

  return (
    <div className="flex w-full flex-col gap-4.5">
      <p className="text-[15px] font-medium text-[#706963]">
        {required && <span className="text-[#FF3D00]">* </span>}
        {question}
      </p>
      {children ? (
        children
      ) : (
        <div className="grid grid-cols-2 gap-2.25">
          {options.map((option) => (
            <StatusBox
              key={option}
              selected={isSelected(option)}
              onClick={() => handleSelect(option)}
            >
              {option}
            </StatusBox>
          ))}
        </div>
      )}
    </div>
  );
}
