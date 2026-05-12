import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import EditButton from '@/assets/icons/settings/edit_button_icon.svg?react';
import EditDoneButton from '@/assets/icons/settings/edit_done_icon.svg?react';
import ChildIcon from '@/assets/icons/settings/son_icon.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import { useChildrenStore } from '@/store/childrenStore';

const Bar = () => {
  return <div className=" shrink-0 h-4 w-full bg-[#FAF7F2]" />;
};
function OpenButton({ open, color = '#252525', className = '' }) {
  // open이 true면 검은색(#252525), false면 연한 회색(#EBE4D9)
  const strokeColor = open ? color : '#EBE4D9';

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 20 20"
      fill="none"
      className={`transition-transform ${open ? 'rotate-180' : ''} ${className}`}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke={strokeColor} // 여기서 결정된 색상을 적용합니다.
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PROFILE_COLOR_MAP = {
  RED: '#FF759D',
  PINK: '#FF99FD',
  BLUE: '#5AA7FF',
  NAVY: '#5A68FF',
  YELLOW: '#FFBA00',
  ORANGE: '#FF8763',
  GREEN: '#00CC9E',
  PURPLE: '#AF5AFF',
};

export default function EditChild() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [isEditMode, setIsEditMode] = useState(false);
  const [birth, setBirth] = useState('');
  const [openArray, setOpenArray] = useState([false, false]);
  const [nickname, setnickName] = useState('');
  const [optionData, setOptionData] = useState({ height: '', weight: '', point: '' });
  const children = useChildrenStore((s) => s.children);
  const editedChild = children.find((c) => c.childId == id);
  const [selectedColor, setSelectedColor] = useState(editedChild?.profileColor ?? 'BLUE');
  return (
    <div className="flex flex-col h-full pb-20 overflow-auto no-scrollbar">
      <div className="px-6 pt-10 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
        <header className="flex justify-between items-center text-[18px] font-semibold mt-7">
          아이 정보 수정하기
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex text-[#AB4C0A] font-medium text-[18px] gap-3"
          >
            {isEditMode && '수정모드'}
            {isEditMode ? <EditDoneButton /> : <EditButton />}
          </button>
        </header>
      </div>
      <Bar />
      <div className="flex items-center p-6.5 gap-5">
        <ChildrenImgBox className="size-27 rounded-[40%]" />
        <div className="flex flex-col flex-1 gap-2">
          <ChildIcon className="size-7" />
          <div className="text-[#B9B2A6] text-[18px] font-medium border-b border-[#EBE4D9]">
            {editedChild?.childName}
          </div>
          {isEditMode ? (
            <input
              value={birth}
              onChange={(e) => setBirth(e.target.value)}
              placeholder="생년월일을 입력해주세요"
              className="w-full outline-none text-[18px] font-medium border-b border-[#EBE4D9]"
            />
          ) : (
            <div className="text-[#B9B2A6] text-[18px] font-medium border-b border-[#EBE4D9]">
              {editedChild?.birthday ?? '생년월일'}
            </div>
          )}
        </div>
      </div>
      <Bar />
      <div>
        <button
          onClick={() => setOpenArray((prev) => [!prev[0], prev[1]])}
          className="w-full flex items-center justify-between px-6 py-7"
        >
          <div className="flex flex-col items-start">
            <p className="text-[15px] font-medium text-[#706963]">표시 정보</p>
            <p className="text-[18px] font-bold">프로필에 표시될 정보에요</p>
          </div>
          <OpenButton open={openArray[0]} />
        </button>
        <div
          className={`grid transition-[grid-template-rows] w-full duration-500 ease-out ${
            openArray[0] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="flex flex-col overflow-hidden items-center px-5.5">
            <div className="h-0.5 w-full bg-[#FAF7F2] mb-5" />
            {!isEditMode ? (
              <div className="w-full">
                <div className="flex w-84.25 h-13 rounded-2xl gap-2.5 items-center justify-center bg-[#F0F2F5]">
                  {Object.entries(PROFILE_COLOR_MAP).map(([name, color]) => (
                    <div
                      style={{ backgroundColor: color }}
                      className={`rounded-[50%] ${name == selectedColor ? 'w-5 h-5 shadow' : 'w-7 h-7'}`}
                    />
                  ))}
                </div>
                <p className='className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"'>
                  {editedChild?.nickname ?? '별명'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex w-84.25 h-13 rounded-2xl gap-2.5 items-center justify-center bg-[#F0F2F5]">
                  {Object.entries(PROFILE_COLOR_MAP).map(([name, color]) => (
                    <div
                      className={`flex justify-center items-center w-7 h-7 rounded-[50%] ${name == selectedColor ? 'shadow-md' : ''}`}
                    >
                      <button
                        onClick={() => setSelectedColor(name)}
                        style={{ backgroundColor: color }}
                        className={`rounded-[50%] duration-300 ease-out transition-all ${name == selectedColor ? 'w-5 h-5' : 'w-7 h-7'}`}
                      />
                    </div>
                  ))}
                </div>
                <input
                  placeholder="별명"
                  value={nickname}
                  onChange={(e) => setnickName(e.target.value)}
                  className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"
                />
              </>
            )}
          </div>
        </div>
      </div>
      <Bar />
      <div>
        <button
          onClick={() => setOpenArray((prev) => [prev[0], !prev[1]])}
          className="flex w-full items-center justify-between px-6 py-7"
        >
          <div className="flex flex-col items-start">
            <p className="text-[15px] font-medium text-[#706963]">추가 정보</p>
            <p className="text-[18px] font-bold">선택적으로 작성해주세요</p>
          </div>
          <OpenButton open={openArray[1]} />
        </button>
        <div
          className={`grid transition-[grid-template-rows] w-full duration-500 ease-out ${
            openArray[1] ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="flex flex-col overflow-hidden items-center px-5.5">
            {!isEditMode ? (
              <div className="w-full">
                <div className="h-0.5 w-full bg-[#FAF7F2] mb-5" />
                <p className='className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"'>
                  {editedChild?.height ?? '신장'}
                </p>
                <p className='className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"'>
                  {editedChild?.weight ?? '몸무게'}
                </p>
                <p className='className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"'>
                  {editedChild?.point ?? '특징'}
                </p>
              </div>
            ) : (
              <>
                <input
                  placeholder="신장"
                  value={optionData.height}
                  onChange={(e) =>
                    setOptionData((prev) => {
                      return { ...prev, height: e.target.value };
                    })
                  }
                  className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"
                />
                <input
                  placeholder="몸무게"
                  value={optionData.weight}
                  onChange={(e) =>
                    setOptionData((prev) => {
                      return { ...prev, weight: e.target.value };
                    })
                  }
                  className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"
                />
                <input
                  placeholder="특징"
                  value={optionData.point}
                  onChange={(e) =>
                    setOptionData((prev) => {
                      return { ...prev, point: e.target.value };
                    })
                  }
                  className="w-full border-b border-[#FAF7F2] outline-none my-5 text-[#3D3835] font-medium text-[18px]"
                />
              </>
            )}
          </div>
        </div>
      </div>
      <Bar />
      {isEditMode && (
        <div className="fixed bottom-3 w-full px-5">
          <Button onClick={() => setIsEditMode(false)}>저장하기</Button>
        </div>
      )}
    </div>
  );
}
