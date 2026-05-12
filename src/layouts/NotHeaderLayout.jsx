import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import { getChildren } from '@/api/child';
import Spinner2 from '@/components/common/Spinner2';
import { useChildrenStore } from '@/store/childrenStore';

export default function NotHeaderLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setChildren = useChildrenStore((s) => s.setChildren);

  useEffect(() => {
    (async () => {
      try {
        const data = await getChildren();
        setChildren(data);
      } catch (error) {
        console.log('아이 목록 불러오기 실패', error);
      }
    })();
  }, [setChildren]);

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="relative mx-auto flex flex-col flex-1 w-full max-w-112.5 h-full bg-white shadow-lg">
        <div className="min-h-0 flex-1 flex flex-col">
          <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <Outlet
              context={{
                setIsModalOpen,
                isModalOpen,
                setIsLoading,
              }}
            />
          </main>
        </div>
        {isLoading && <Spinner2 />}
      </div>
      <ScrollRestoration />
    </div>
  );
}
