import { useEffect, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import { getChildren } from '@/api/child';
import Header from '@/components/common/Header';
import NavBar from '@/components/common/NavBar';
import { useChildrenStore } from '@/store/childrenStore';

export default function RootLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setChildren = useChildrenStore((s) => s.setChildren);

  useEffect(() => {
    (async () => {
      try {
        const data = await getChildren();
        console.log(data);
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
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <Outlet context={{ setIsModalOpen, isModalOpen, setIsLoading }} />
          </main>
          <NavBar />
        </div>
        {isLoading && <Loading />}
      </div>
      <ScrollRestoration />
    </div>
  );
}
