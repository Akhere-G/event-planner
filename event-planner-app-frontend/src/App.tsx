import { Navigate, Route, Routes } from "react-router";
import { Login, Register, TripDetails, Trips } from "./pages";
import { useCheckUserQuery } from "./features/auth/authApiSlice";
import { useEffect } from "react";
import {
  selectIsAuthenticated,
  setCredentials,
} from "./features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ProtectedRoute } from "./components";

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isLoading, data } = useCheckUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      console.log(data);
      dispatch(setCredentials(data.data.userId));
    }
  }, [data, dispatch]);

  if (isLoading) {
    return <></>;
  }
  return (
    <div>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute redirect={!isAuthenticated} redirectTo="/login">
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trip/:tripId"
          element={
            <ProtectedRoute redirect={!isAuthenticated} redirectTo="/login">
              <TripDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute redirect={isAuthenticated} redirectTo="/">
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute redirect={isAuthenticated} redirectTo="/">
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
