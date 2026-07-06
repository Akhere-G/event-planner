import { Navigate, useLocation } from "react-router";

export default function ProtectedRoute({
  redirect,
  redirectTo,
  children,
}: {
  redirect: boolean;
  redirectTo: string;
  children: React.ReactNode;
}) {
  const location = useLocation();

  if (redirect) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  return children;
}
