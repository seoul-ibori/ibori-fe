function renderMessage(message) {
  if (!message) return null;
  const match = message.match(/^(.+? 님께서 아이 )(.+?)(의 .+)$/);
  if (!match) return message;
  const [, prefix, childName, suffix] = match;
  return (
    <>
      {prefix}
      <span className="font-semibold text-[#1D1B1A]">{childName}</span>
      {suffix}
    </>
  );
}

export default function AlarmBar({ message, timeText }) {
  return (
    <li className="border-b border-[#FAF7F2] px-5.25 py-3.5">
      <p className="text-[12px] font-medium leading-4 text-[#706963]">{renderMessage(message)}</p>
      <p className="mt-1.5 text-right text-[12px] font-medium leading-[13px] text-[#A8A19A]">
        {timeText}
      </p>
    </li>
  );
}
