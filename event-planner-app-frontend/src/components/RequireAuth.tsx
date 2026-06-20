import { Navigate, useLocation } from "react-router";

export default function RequireAuth({
  isAuth,
  isLoading,
  children,
}: {
  isAuth: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading your trips...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
