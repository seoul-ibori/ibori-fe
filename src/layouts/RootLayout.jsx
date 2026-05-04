import { useState } from 'react';
import { Outlet, ScrollRestoration } from 'react-router';

import Header from '@/components/common/Header';
import NavBar from '@/components/common/NavBar';

export default function RootLayout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      <div className="relative mx-auto flex flex-col flex-1 w-full max-w-112.5 h-full bg-white shadow-lg">
        <div className="min-h-0 flex-1 flex flex-col">
          <Header />
          <main className="flex-1 min-h-0 overflow-y-auto">
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
