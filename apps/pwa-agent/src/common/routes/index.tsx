import { useRoutes } from 'react-router-dom';
import { useMembers } from '@stores/members';
import { useTheme } from '@stores/theme';
import { Landing } from '@views';
import { LoadStores } from './LoadStorage';
import { LoadTheme } from './LoadTheme';
import { Forward } from './Forward';
import { Dashboard, Profile, Settings } from '@views/user';
import { Apps } from '@views/apps';
import { Watch } from '@views/watch';
import { Create, Import, Unlock } from '@views/auth';
import { PublicLayout, PrivateLayout } from '@components/layout';

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
              { path: '/user/profile', element: <Profile /> },
              { path: '/user/credentials', element: <Landing /> },
              { path: '/user/credentials/:id', element: <Landing /> },
              { path: '/user/apps', element: <Apps /> },
              { path: '/user/apps/:id', element: <Landing /> },
              { path: '/user/dashboard', element: <Landing /> },
              { path: '/user/settings', element: <Settings /> },
              { path: '/user/settings/profile', element: <Settings /> },
              { path: '/user/settings/security', element: <Settings /> },
              { path: '/user/worker', element: <Watch /> },
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

