import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import EditButton from '@/assets/icons/settings/edit_button_icon.svg?react';
import EditDoneButton from '@/assets/icons/settings/edit_done_icon.svg?react';
import ChildIcon from '@/assets/icons/settings/son_icon.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';

const Bar = () => {
  return <div className="h-4 w-full bg-[#FAF7F2]" />;
};

export default function EditChild() {
  const navigate = useNavigate();

  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="flex flex-col">
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
      <div className="flex">
        <ChildrenImgBox className="size-27 rounded-[40%]" />
        <div className="flex flex-col">
          <ChildIcon />
          <div>{}</div>
        </div>
      </div>
    </div>
  );
}
