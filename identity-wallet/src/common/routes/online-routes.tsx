import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

export const OnlineRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full flex items-center justify-center">
        </div>
      }
    >
      <Outlet />
    </Suspense>
  );
};