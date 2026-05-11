import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { getChildren } from '@/api/child';
import TrashIcon from '@/assets/icons/settings/trash_icon.svg?react';
import ChildCard from '@/components/Setting/ChildCard';
import BackButtonIcon from '@/components/common/BackButtonIcon';

export default function ChildList() {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await getChildren();
        setChildren(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log('아이 목록 조회 실패', error);
      }
    };
    fetchChildren();
  }, []);

  const handleCardClick = (child) => {
    navigate(`/edit-child?childId=${child.childId}`);
  };

  const handleDelete = (child) => {
    setChildren((prev) => prev.filter((c) => c.childId !== child.childId));
  };

  return (
    <div className="flex flex-col">
      <div className="px-6 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
      </div>

      <div className="flex items-center justify-between px-6 pt-3 pb-3.5">
        <h1 className="text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">
          아이 정보 수정하기
        </h1>
        <div className="flex items-center gap-3">
          {deleteMode && (
            <span className="text-[18px] font-medium tracking-[-0.45px] text-[#AB4C0A]">
              삭제모드
            </span>
          )}
          <button
            type="button"
            onClick={() => setDeleteMode((v) => !v)}
            aria-label="삭제 모드 전환"
            aria-pressed={deleteMode}
            className={`flex size-7.5 items-center justify-center rounded-md ${
              deleteMode ? 'bg-[#AB4C0A]' : 'bg-[#FFC721]'
            }`}
          >
            <TrashIcon className="size-4.75" />
          </button>
        </div>
      </div>

      <div className="h-3.75 w-full bg-[#FAF7F2]" />

      <div>
        {children.map((child) => (
          <ChildCard
            key={child.childId}
            child={child}
            deleteMode={deleteMode}
            onClick={() => handleCardClick(child)}
            onDelete={() => handleDelete(child)}
          />
        ))}
      </div>
    </div>
  );
}
