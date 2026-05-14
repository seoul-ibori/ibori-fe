import { useState } from 'react';
import { useOutletContext } from 'react-router';
import { useNavigate, useParams } from 'react-router-dom';

import { patchChildren } from '@/api/child';
import EditButton from '@/assets/icons/settings/edit_button_icon.svg?react';
import EditDoneButton from '@/assets/icons/settings/edit_done_icon.svg?react';
import ChildIcon from '@/assets/icons/settings/son_icon.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';
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

function formatBirthDateDisplay(digits) {
  if (!digits) return '';
  let result = digits.slice(0, 4);
  if (digits.length >= 4) result += '년';
  if (digits.length >= 5) result += ` ${digits.slice(4, 6)}`;
  if (digits.length >= 6) result += '월';
  if (digits.length >= 7) result += ` ${digits.slice(6, 8)}`;
  if (digits.length >= 8) result += '일생';
  return result;
}

export default function EditChild() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setIsLoading, showToast } = useOutletContext();

  const [isEditMode, setIsEditMode] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [openArray, setOpenArray] = useState([false, false]);
  const [nickname, setnickName] = useState('');
  const [optionData, setOptionData] = useState({ height: '', weight: '', memo: '' });
  const children = useChildrenStore((s) => s.children);
  const editedChild = children.find((c) => c?.childId == id);
  const updateChildren = useChildrenStore((s) => s.updateChildren);
  const [selectedColor, setSelectedColor] = useState(editedChild?.profileColor ?? 'SKY_BLUE');

  const handleEdit = async () => {
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }
    setIsLoading(true);
    try {
      const profileData = {};
      const rawData = {
        profileColor: selectedColor,
        birthDate: birthDate,
        nickname: nickname,
        height: optionData.height,
        weight: optionData.weight,
        memo: optionData.memo,
      };
      for (const key in rawData) {
        if (rawData[key]) {
          profileData[key] = rawData[key];
        }
      }
      await patchChildren(editedChild.childId, profileData);
      updateChildren(editedChild.childId, profileData);
      setIsEditMode(false);
    } catch (error) {
      console.log('정보 수정 실패' + error);
      showToast();
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex flex-col h-full pb-20 overflow-auto no-scrollbar">
      <div className="px-6 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
        <header className="flex justify-between items-center text-[18px] font-semibold mt-7">
          아이 정보 수정하기
          <button
            onClick={() => handleEdit()}
            className="flex text-[#AB4C0A] font-medium text-[18px] gap-3"
          >
            {isEditMode && '수정모드'}
            {isEditMode ? <EditDoneButton /> : <EditButton />}
          </button>
        </header>
      </div>
      <Bar />
      <div className="flex items-center p-6.5 gap-5">
        <ChildrenImgBox className="size-27 rounded-[40%]" labelColor={selectedColor} />
        <div className="flex flex-col flex-1 gap-2">
          <ChildIcon className="size-7" />
          <div className="text-[#B9B2A6] text-[18px] font-medium border-b border-[#EBE4D9]">
            {editedChild?.childName}
          </div>
          {isEditMode ? (
            <input
              value={formatBirthDateDisplay(birthDate)}
              onChange={(e) => {
                const newValue = e.target.value;
                const newDigits = newValue.replace(/\D/g, '');
                const oldDisplay = formatBirthDateDisplay(birthDate);
                if (newValue.length < oldDisplay.length && newDigits.length === birthDate.length) {
                  setBirthDate(birthDate.slice(0, -1));
                  return;
                }
                setBirthDate(newDigits.slice(0, 8));
              }}
              placeholder="생년월일을 입력해주세요"
              className="w-full outline-none text-[18px] font-medium border-b border-[#EBE4D9]"
            />
          ) : (
            <div className="text-[#B9B2A6] text-[18px] font-medium border-b border-[#EBE4D9]">
              {formatBirthDateDisplay(editedChild?.birthDate) ?? '생년월일'}
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
                      className={`flex justify-center items-center w-7 h-7 rounded-[50%] ${name == selectedColor ? 'shadow-md' : ''}`}
                    >
                      <div
                        style={{ backgroundColor: color }}
                        className={`rounded-[50%] ${name == selectedColor ? 'w-5 h-5 shadow' : 'w-7 h-7'}`}
                      />
                    </div>
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
                  {editedChild?.memo ?? '특징'}
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
                  value={optionData.memo}
                  onChange={(e) =>
                    setOptionData((prev) => {
                      return { ...prev, memo: e.target.value };
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
          <Button onClick={() => handleEdit()}>저장하기</Button>
        </div>
      )}
    </div>
  );
}
