import { Navigate, Outlet, matchPath, useLocation } from 'react-router-dom';
import { Create, Import, Unlock } from '@views/auth';
import { useMembers } from '@stores/members';
import { useUser } from '@stores/user';

const CreateRedirect = () => {
  const { members } = useMembers(state => ({ members: state.members }));
  const { user } = useUser(state => ({ user: state.user }))
  const location = useLocation()
  const isUnlock = matchPath('/auth/unlock', location.pathname)
  const isRoot = matchPath('/auth', location.pathname)
  const hasMembers = members.length !== 0

  if (user) {
    return <Navigate to="/user" />
  } else if (hasMembers) {
    return isRoot ? <Navigate to="/auth/unlock" /> : <Outlet />
  } else if (isRoot || isUnlock) {
    return <Navigate to="/auth/create" />
  } else {
    return <Outlet />
  }
};

export const publicRoutes = [
  {
    path: '/auth/*',
    element: <CreateRedirect />,
    children: [
      { path: 'create', element: <Create /> },
      { path: 'unlock', element: <Unlock /> },
      { path: 'import', element: <Import /> },
      { path: '*', element: <Navigate to="." /> },
    ],
  },
];