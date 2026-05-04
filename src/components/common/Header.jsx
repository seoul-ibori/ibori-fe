import BellIcon from '@/assets/icons/main/bell_icon.svg?react';
import LogoIcon from '@/assets/icons/main/logo_icon.svg?react';
import UserIcon from '@/assets/icons/main/user_icon.svg?react';

export default function Header() {
  return (
    <header className="flex justify-between h-13.25 px-6 items-center">
      <LogoIcon />
      <div className=" flex gap-5.5 items-center">
        <BellIcon />
        <UserIcon />
      </div>
    </header>
  );
}
