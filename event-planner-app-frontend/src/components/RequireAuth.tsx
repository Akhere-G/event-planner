import { Navigate, useLocation } from "react-router";
import StateGate from "./StateGate";
import LoadingState from "./LoadingState";

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
  const from = location.state?.from ?? location.pathname;

  if (isLoading) {
    return (
      <div className="container">
        <LoadingState message="Loading your trips..." />
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from }} replace />;
  }

  return children;
}
