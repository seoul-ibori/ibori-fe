import { useEffect, useRef, useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import { TokenManager } from '@/api/api';
import { getChildren } from '@/api/child';
import Header from '@/components/common/Header';
import NavBar from '@/components/common/NavBar';
import Spinner2 from '@/components/common/Spinner2';
import Toast from '@/components/common/Toast';
import { useChildrenStore } from '@/store/childrenStore';

export default function RootLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastTimerRef = useRef(null);

  const showToast = (message = '잠시후 다시 시도해주세요') => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(''), 2500);
  };

  const setChildren = useChildrenStore((s) => s.setChildren);

  useEffect(() => {
    if (!TokenManager.getAccessToken()) return;
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
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <Outlet context={{ setIsModalOpen, isModalOpen, setIsLoading, showToast }} />
          </main>
          <NavBar />
        </div>
        {isLoading && <Spinner2 />}
        <Toast message={toastMessage} />
      </div>
      <ScrollRestoration />
    </div>
  );
}
