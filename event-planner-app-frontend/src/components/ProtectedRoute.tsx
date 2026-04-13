import { Navigate } from "react-router";

export default function ProtectedRoute({
  redirect,
  redirectTo,
  children,
}: {
  redirect: boolean;
  redirectTo: string;
  children: React.ReactNode;
}) {
  if (redirect) return <Navigate to={redirectTo} />;
  return children;
}
