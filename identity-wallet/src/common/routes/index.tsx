import { useRoutes } from 'react-router-dom';
import { commonRoutes } from './common-routes';
import { protectedRoutes } from './protected-routes';
import { publicRoutes } from './public-routes';
import { useUser } from '@stores/user';

export const AppRoutes = () => {
  const { user } = useUser(state => ({ user: state.user }))
  const routes = user ? protectedRoutes : publicRoutes;
  const element = useRoutes([...routes, ...commonRoutes]);
  return <>{element}</>;
};