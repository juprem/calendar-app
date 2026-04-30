import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { DailyView } from './views/DailyView';
import { WeeklyView } from './views/WeeklyView';
import { MonthlyView } from './views/MonthlyView';
import { ContactsView } from './views/ContactsView';
import { SignInView } from './views/SignInView';

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <SignInView />,
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DailyView />,
      },
      {
        path: 'weekly',
        element: <WeeklyView />,
      },
      {
        path: 'monthly',
        element: <MonthlyView />,
      },
      {
        path: 'contacts',
        element: <ContactsView />,
      },
    ],
  },
]);
