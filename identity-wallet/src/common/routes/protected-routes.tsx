import { Navigate } from 'react-router-dom';
import { NotFound } from '@views';
import { Apps } from '@views/apps';
import { Dashboard, Lock, Profile, Settings } from '@views/user';
import { OnlineRoutes } from './online-routes';

export const protectedRoutes = [
  {
    path: '/apps/*',
    element: <OnlineRoutes />,
    children: [
      { path: '', element: <Apps /> },
      { path: '*', element: <NotFound />}
    ]
  },
  {
    path: '/user/*',
    children: [
      { path: 'profile', element: <Profile /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'lock', element: <Lock /> },
      { path: '*', element: <Navigate to="dashboard" /> },
    ],
  },
];