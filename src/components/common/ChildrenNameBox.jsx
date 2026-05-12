import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';

export default function ChildrenNameBox({
  name,
  labelColor = 'SKY_BLUE',
  className = 'rounded-[5px] px-2 py-0.5 text-[11px] tracking-[-0.44px]',
}) {
  const mappingColor = PROFILE_COLOR_MAP[labelColor];
  return (
    <div
      className={`inline-flex items-center justify-center font-medium whitespace-nowrap text-[#FFFCF9] ${className}`}
      style={{ backgroundColor: mappingColor }}
    >
      {name}
    </div>
  );
}
