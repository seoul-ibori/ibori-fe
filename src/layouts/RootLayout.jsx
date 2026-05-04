import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import Header from '@/components/common/Header';

export default function RootLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="relative mx-auto flex flex-col flex-1 w-full max-w-112.5 h-full bg-white shadow-lg">
        <div className="min-h-0 flex-1">
          <Header />
          <Outlet context={{ setIsModalOpen, isModalOpen, setIsLoading }} />
        </div>
        {isLoading && <Loading />}
      </div>
      <ScrollRestoration />
    </div>
  );
}
