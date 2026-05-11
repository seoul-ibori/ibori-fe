export default function ChildrenNameBox({
  name,
  labelColor = '#5AA7FF',
  className = 'rounded-[5px] px-2 py-0.5 text-[11px] tracking-[-0.44px]',
}) {
  return (
    <div
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap text-[#FFFCF9] ${className}`}
      style={{ backgroundColor: labelColor }}
    >
      {name}
    </div>
  );
}
