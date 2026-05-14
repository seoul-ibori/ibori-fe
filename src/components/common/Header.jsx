import { useNavigate } from 'react-router-dom';

import BellIcon from '@/assets/icons/main/bell_icon.svg?react';
import LogoIcon from '@/assets/icons/main/logo_icon.svg?react';
import UserIcon from '@/assets/icons/main/user_icon.svg?react';

export default function Header() {
  const navigate = useNavigate();
  const isLogin = true;
  return (
    <header className="flex justify-between h-13.25 px-6 mt-12.5 items-center">
      <LogoIcon onClick={() => navigate('/')} />
      <div className=" flex gap-5.5 items-center">
        <BellIcon onClick={() => navigate(isLogin ? '/alarms' : '/login')} />
        <UserIcon onClick={() => navigate(isLogin ? '/settings' : '/login')} />
      </div>
    </header>
  );
}
