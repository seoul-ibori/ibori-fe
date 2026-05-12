import { RouterProvider, createBrowserRouter } from 'react-router';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import NotHeaderLayout from '@/layouts/NotHeaderLayout';
import RootLayout from '@/layouts/RootLayout';
import ServiceLayout from '@/layouts/ServiceLayout';

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
      { path: '/hospital', lazy: page(() => import('@/pages/SearchHospital/SearchHospital')) },
    ],
  },
  {
    Component: ServiceLayout,
    children: [
      { path: '/login', lazy: page(() => import('@/pages/Auth/SignIn')) },
      { path: '/signup', lazy: page(() => import('@/pages/Auth/SignUp')) },
      { path: '/signup-select', lazy: page(() => import('@/pages/Auth/SignUpSelect')) },
      { path: '/introduce', lazy: page(() => import('@/pages/Main/ServiceIntroduce')) },
      { path: '/record-update', lazy: page(() => import('@/pages/Main/RecordUpdate')) },
      { path: '/create-question', lazy: page(() => import('@/pages/Question/CreateQuestion')) },
      { path: '/question-list', lazy: page(() => import('@/pages/Question/QuestionList')) },
      //{ path: "", lazy: page(() => import("파일 경로")) },
    ],
  },
  {
    Component: NotHeaderLayout,
    children: [
      { path: '/settings', lazy: page(() => import('@/pages/Setting/Settings')) },
      { path: '/alarms', lazy: page(() => import('@/pages/Setting/Alarms')) },
      { path: '/child-list', lazy: page(() => import('@/pages/Setting/ChildList')) },
      { path: '/edit-child/:id', lazy: page(() => import('@/pages/Setting/EditChild')) },
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
