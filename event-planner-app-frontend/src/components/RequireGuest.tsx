import { Navigate, useLocation } from "react-router";

export default function RequireGuest({
  isAuth,
  isLoading,
  children,
}: {
  isAuth: boolean;
  isLoading: boolean;
  children: React.ReactNode;
}) {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (isLoading) {
    return <div className="flex justify-center p-4">Checking session...</div>;
  }

  if (isAuth) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
