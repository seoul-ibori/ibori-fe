import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';

import { getChildren } from '@/api/child';
import { useChildrenStore } from '@/store/childrenStore';

export default function ServiceLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const setChildren = useChildrenStore((s) => s.setChildren);
  const { pathname } = useLocation();

  useEffect(() => {
    const skipPaths = ['/login', '/signup', '/signup-select', '/introduce'];

    // 2. 현재 경로가 skipPaths에 포함되어 있는지 확인합니다.
    const shouldSkip = skipPaths.includes(pathname);
    if (shouldSkip) return;
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
                setModalContent,
              }}
            />
          </main>
        </div>
        {isLoading && <Loading />}
        {isModalOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
            {modalContent}
          </div>
        )}
      </div>
      <ScrollRestoration />
    </div>
  );
}
