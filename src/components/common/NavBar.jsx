import { NavLink } from 'react-router';

import DocumentGrayIcon from '@/assets/icons/main/document_gray_icon.svg?react';
import DocumentYellowIcon from '@/assets/icons/main/document_yellow_icon.svg?react';
import HomeGrayIcon from '@/assets/icons/main/home_gray_icon.svg?react';
import HomeYellowIcon from '@/assets/icons/main/home_yellow_icon.svg?react';
import HospitalGrayIcon from '@/assets/icons/main/hospital_gray_icon.svg?react';
import HospitalYellowIcon from '@/assets/icons/main/hospital_yellow_icon.svg?react';

const TABS = [
  {
    to: '/hospital',
    label: '근처 병원',
    InactiveIcon: HospitalGrayIcon,
    ActiveIcon: HospitalYellowIcon,
  },
  {
    to: '/',
    label: '홈',
    InactiveIcon: HomeGrayIcon,
    ActiveIcon: HomeYellowIcon,
  },
  {
    to: '/summary',
    label: '진료 요약',
    InactiveIcon: DocumentGrayIcon,
    ActiveIcon: DocumentYellowIcon,
  },
];

export default function NavBar() {
  return (
    <footer className="bg-white rounded-t-[20px] shadow-[0_-4px_20px_rgba(220,224,231,0.5)] mt-auto">
      <nav className="flex items-center justify-center gap-22.5 py-4">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className="flex flex-col items-center gap-1.5"
          >
            {({ isActive }) => {
              const Icon = isActive ? tab.ActiveIcon : tab.InactiveIcon;
              return (
                <>
                  <Icon className="size-[30px]" />
                  <span
                    className={`text-xs font-medium tracking-[-0.48px] ${
                      isActive ? 'text-[#FFC721]' : 'text-[#7D7D7D]'
                    }`}
                  >
                    {tab.label}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>
    </footer>
  );
}
