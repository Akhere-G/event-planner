import { Navigate, useLocation } from "react-router";
import StateGate from "./StateGate";

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
  const from = location.state?.from || "/";

  return (
    <StateGate loadingStateProps={{ isLoading, message: "Checking session..." }}>
      {isAuth ? <Navigate to={from} replace /> : children}
    </StateGate>
  );
}
