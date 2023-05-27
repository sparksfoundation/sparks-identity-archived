import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Landing } from '@views';
import { useMembers } from '@stores/members';
import { useUser } from '@stores/user';

const LoginRedirect = () => {
  const { members } = useMembers(state => ({ members: state.members }));
  const { user } = useUser(state => ({ user: state.user }))
  const location = useLocation()
  const isRoot = location.pathname === '/'
  const hasMembers = members.length !== 0
  if (user) return <Navigate to="/user" />
  if (isRoot && hasMembers) return <Navigate to="/auth/unlock" /> 
  return <Outlet />
};

export const commonRoutes = [
  {
    path: '',
    element: <LoginRedirect />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '*', element: <Navigate to="." /> },
    ]
  }
];