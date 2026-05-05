export default function ChildrenBox({ name, imageUrl, labelColor = '#5AA7FF' }) {
  return (
    <div className="flex flex-col items-center gap-1.25">
      <div className="size-11.5 overflow-hidden rounded-[15.871px] bg-[#FFC721]">
        {imageUrl && <img src={imageUrl} alt={name} className="size-full object-cover" />}
      </div>
      <div
        className="flex items-center justify-center rounded-[5px] px-2 py-0.5"
        style={{ backgroundColor: labelColor }}
      >
        <span className="whitespace-nowrap text-[11px] font-medium tracking-[-0.44px] text-[#FFFCF9]">
          {name}
        </span>
      </div>
    </div>
  );
}
