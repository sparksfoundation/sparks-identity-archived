import { Navigate } from 'react-router-dom';
import { Apps } from '@views/apps';
import { Dashboard, Lock, Profile, Settings } from '@views/user';

export const protectedRoutes = [
  {
    path: '/user/*',
    children: [
      { path: 'profile', element: <Profile /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'lock', element: <Lock /> },
      { path: 'apps',element: <Apps /> },
      { path: '*', element: <Navigate to="dashboard" /> },
    ],
  },
];