import { useRoutes } from 'react-router-dom';
import { useMembers } from '@stores/members';
import { useTheme } from '@stores/theme';
import { LoadStores } from './LoadStorage';
import { LoadTheme } from './LoadTheme';
import { Forward } from './Forward';
import { PublicLayout, PrivateLayout } from '@layout';

import { Landing } from '@pages';
import { Create, Import, Unlock } from '@pages/auth';
import { Apps } from '@pages/user/apps';
import { Dashboard } from '@pages/user';
import { Worker } from '@pages/user/worker';

const routes = [
  {
    element: <LoadStores stores={[useTheme, useMembers]} />,
    children: [
      {
        element: <LoadTheme />,
        children: [
          {
            element: <PublicLayout />, children: [
              { path: '', element: <Forward Component={Landing} usersTo="/user" membersTo="/auth/unlock" /> },
              { path: '/auth/create', element: <Forward Component={Create} membersTo="/auth/unlock" /> },
              { path: '/auth/unlock', element: <Forward Component={Unlock} usersTo="/user" guestsTo="/auth/create" /> },
              { path: '/auth/import', element: <Forward Component={Import} usersTo="/user" /> },
            ]
          },
          {
            element: <PrivateLayout />, children: [
              { path: '/user', element: <Dashboard /> },
              { path: '/user/apps', element: <Apps /> },
              { path: '/user/apps/:id', element: <Landing /> },
              { path: '/user/dashboard', element: <Landing /> },
              { path: '/user/worker', element: <Worker /> },
            ]
          }
        ]
      }
    ]
  }
]

export const AppRoutes = () => {
  const element = useRoutes(routes);
  return <>{element}</>;
};

