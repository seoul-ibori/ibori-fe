import { useState } from 'react';

import ChildrenBox from '@/components/Main/ChildrenBox';
import Calendar from '@/components/Summary/Calender';
import { useChildrenStore } from '@/store/childrenStore';

export default function Summary() {
  const children = useChildrenStore((s) => s.children);
  const [filterChildId, setFilterChildId] = useState(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      {children.length > 0 ? (
        <>
          <div className="h-[5px] w-full shrink-0 bg-[#FFFCF9]" aria-hidden />
          <div className="shrink-0 no-scrollbar overflow-x-auto px-6 pb-3 pt-2">
            <div className="flex w-max min-w-full items-end justify-start gap-3.25">
              {children
                .filter((c) => c.childId != null && Number.isFinite(Number(c.childId)))
                .map((child) => {
                  const cid = Number(child.childId);
                  const selected = filterChildId != null && filterChildId === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setFilterChildId(selected ? null : cid)}
                      className="shrink-0 border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FFC721]/50 focus-visible:ring-offset-2"
                    >
                      <ChildrenBox
                        name={child.nickname || child.childName}
                        imageUrl={child.imageUrl}
                        labelColor={child.profileColor}
                        selected={selected}
                      />
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col">
        <Calendar filterChildId={filterChildId} />
      </div>
    </div>
  );
}
