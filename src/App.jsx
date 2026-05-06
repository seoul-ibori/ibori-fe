import { RouterProvider, createBrowserRouter } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RootLayout from '@/layouts/RootLayout';
import ServiceLayout from '@/layouts/ServiceLayout';
import ProtectedRoute from '@/router/ProtectedRoute';

const page = (importFn) => () => importFn().then((m) => ({ Component: m.default }));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: '/', lazy: page(() => import('@/pages/Main/main')) },
      { path: '/summary', lazy: page(() => import('@/pages/Summary')) },
      {
        Component: ProtectedRoute,
        children: [
          //{ path: "", lazy: page(() => import("파일 경로")) },
        ],
      },
    ],
  },
  {
    Component: ServiceLayout,
    children: [
      { path: '/login', lazy: page(() => import('@/pages/Auth/SignIn')) },
      { path: '/signup', lazy: page(() => import('@/pages/Auth/SignUp')) },
      { path: '/signup-select', lazy: page(() => import('@/pages/Auth/SIgnUpSelect')) },
      { path: '/introduce', lazy: page(() => import('@/pages/Main/ServiceIntroduce')) },
      //{ path: "", lazy: page(() => import("파일 경로")) },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
