import { Navigate, Route, Routes } from "react-router";
import { AddTrip, Login, Register, TripDetails, Trips } from "./pages";
import { useCheckUserQuery } from "./features/auth/services/authApiSlice";
import { useEffect } from "react";
import {
  selectIsAuthenticated,
  setCredentials,
} from "./features/auth/services/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ProtectedRoute } from "./components";
import { Header } from "./layout";

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isLoading, data } = useCheckUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    if (data) {
      dispatch(setCredentials(data.data.userId));
    }
  }, [data, dispatch]);

  if (isLoading) {
    return <></>;
  }
  const authLinks = [
    { title: "Trips", url: "/" },
    { title: "Add Trip", url: "/addtrip" },
  ];

  const unauthLinks = [
    { title: "Login", url: "/login" },
    { title: "Register", url: "/register" },
  ];

  return (
    <>
      <Header links={isAuthenticated ? authLinks : unauthLinks} />
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
          path="/addtrip"
          element={
            <ProtectedRoute redirect={!isAuthenticated} redirectTo="/login">
              <AddTrip />
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
    </>
  );
}

export default App;
