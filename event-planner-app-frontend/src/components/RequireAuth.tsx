import { Navigate, useLocation } from "react-router";
import StateGate from "./StateGate";

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

  return (
    <StateGate
      loadingStateProps={{ isLoading, message: "Loading your trips..." }}
    >
      {!isAuth ? (
        <Navigate to="/login" state={{ from }} replace />
      ) : (
        children
      )}
    </StateGate>
  );
}
