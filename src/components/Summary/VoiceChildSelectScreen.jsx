import { useState } from 'react';

import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import { VOICE_CHILDREN } from '@/constants/voiceChildren';

const CHILDREN = VOICE_CHILDREN;

export default function VoiceChildSelectScreen({ isOpen, onClose, onConfirm = () => {} }) {
  const [selectedChildId, setSelectedChildId] = useState('2');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-[#ECECEC]">
      <div className="mx-auto flex h-full w-full max-w-112.5 flex-col bg-[#FFFFFF]">
        <header className="bg-white px-6 pt-8 pb-6">
          <button type="button" onClick={onClose} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
        </header>

        <div className="h-4 w-full bg-[#FAF7F2]" />

        <section className="bg-white px-[29px] py-[38px]">
          <h2 className="text-[18px] font-bold leading-[27px] text-black">
            어떤 아이의 질문지를
            <br />
            만들어 드릴까요?
          </h2>
        </section>

        <section>
          {CHILDREN.map((child, index) => {
            const selected = selectedChildId === child.id;
            const rowBg = selected
              ? 'bg-[#A8A19A]'
              : index % 2 === 0
                ? 'bg-[#FFFCF9]'
                : 'bg-[#FAF7F2]';
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`flex w-full items-center gap-[18px] px-[26px] py-[17px] text-left ${rowBg}`}
              >
                <ChildrenImgBox
                  labelColor={child.labelColor}
                  selected={selected}
                  className="h-[46.55px] w-[46.554px] rounded-[15.871px]"
                />
                <span
                  className={`text-[18px] font-medium tracking-[-0.72px] ${
                    selected ? 'text-[#FFFCF9]' : 'text-[#706963]'
                  }`}
                >
                  {child.name}
                </span>
              </button>
            );
          })}
        </section>

        <div className="mt-auto px-5 pb-8">
          <Button
            onClick={() =>
              onConfirm(CHILDREN.find((child) => child.id === selectedChildId) ?? null)
            }
            bgColor="#FFC721"
            textColor="#FFFFFF"
          >
            아이 선택하기
          </Button>
        </div>
      </div>
    </div>
  );
}
