import { Navigate } from 'react-router-dom';
import { Apps } from '@views/apps';
import { Dashboard, Lock, Profile, Settings } from '@views/user';
import { Watch } from '@views/watch';

export const protectedRoutes = [
  {
    path: '/user/*',
    children: [
      { path: 'profile', element: <Profile /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'settings', element: <Settings /> },
      { path: 'lock', element: <Lock /> },
      { path: 'apps',element: <Apps /> },
      { path: 'watch',element: <Watch /> },
      { path: '*', element: <Navigate to="dashboard" /> },
    ],
  },
];