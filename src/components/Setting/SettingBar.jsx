export default function SettingBar({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-5.25 py-5"
    >
      <div className="flex items-center gap-4">
        <span className="flex w-5.25 justify-center">{icon}</span>
        <span className="text-[15px] font-semibold tracking-[-0.3px] text-[#3D3835]">{label}</span>
      </div>
    </button>
  );
}
