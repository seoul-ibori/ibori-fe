import { useState } from 'react';
import { useNavigate } from 'react-router';

import ChildIcon from '@/assets/icons/settings/child_icon.svg?react';
import ChildPlusIcon from '@/assets/icons/settings/child_plus_icon.svg?react';
import HouseIcon from '@/assets/icons/settings/house_icon.svg?react';
import LockIcon from '@/assets/icons/settings/lock_icon.svg?react';
import LogoutIcon from '@/assets/icons/settings/logout_icon.svg?react';
import PersonIcon from '@/assets/icons/settings/person_icon.svg?react';
import Bar from '@/components/Main/Bar';
import MemberBar from '@/components/Setting/MemberBar';
import SettingBar from '@/components/Setting/SettingBar';
import BackButtonIcon from '@/components/common/BackButtonIcon';

const INITIAL_MEMBERS = [
  { id: '1', role: '엄마', roleColor: '#FF7595', name: '김엄마' },
  { id: '2', role: '할아버지', roleColor: '#3EB839', name: '김할아버지' },
];

export default function Settings() {
  const navigate = useNavigate();
  const [members, setMembers] = useState(INITIAL_MEMBERS);

  const handleDelete = (id) => setMembers((prev) => prev.filter((m) => m.id !== id));

  return (
    <div className="flex flex-col">
      <div className="px-6 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
      </div>

      <div className="px-6 pt-3 pb-3.5">
        <h1 className="text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">설정</h1>
      </div>

      <Bar />

      <section className="pt-5.25 pb-4">
        <div className="flex items-center gap-4 px-5.25 pb-2.5">
          <span className="flex w-5.25 justify-center">
            <PersonIcon />
          </span>
          <p className="text-[15px] font-semibold text-[#1D1B1A]">가족 구성원</p>
        </div>
        <div className="pl-13.75">
          {members.map((member) => (
            <MemberBar
              key={member.id}
              role={member.role}
              roleColor={member.roleColor}
              name={member.name}
              onDelete={() => handleDelete(member.id)}
            />
          ))}
        </div>
      </section>

      <Bar />

      <section className="py-1">
        <SettingBar icon={<HouseIcon />} label="구성원 추가하기" />
        <SettingBar icon={<ChildPlusIcon />} label="아이 등록하기" />
        <SettingBar icon={<ChildIcon />} label="아이 정보 수정하기" />
        <SettingBar icon={<LockIcon />} label="가족 비밀번호 수정하기" />
        <SettingBar icon={<LogoutIcon />} label="로그아웃하기" />
      </section>
    </div>
  );
}
