import LoadingSpinner from '@/assets/icons/loading_spinner.svg?react';

export default function Spinner2() {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30">
      <LoadingSpinner className="size-25" />
    </div>
  );
}
