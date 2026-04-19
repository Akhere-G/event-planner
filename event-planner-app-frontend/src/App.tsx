import { Navigate, Route, Routes } from "react-router";
import {
  AddTrip,
  InvitesPage,
  Login,
  Register,
  TripPage,
  Trips,
} from "./pages";
import { useCheckUserQuery } from "./features/auth/services/authApiSlice";
import { useEffect } from "react";
import {
  selectIsAuthenticated,
  setCredentials,
} from "./features/auth/services/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ProtectedRoute } from "./components";
import { Header } from "./layout";
import "react-tooltip/dist/react-tooltip.css";
import ModalManager from "./features/modal/components/ModalManager";

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
    { title: "Invites", url: "/invites" },
  ];

  const unauthLinks = [
    { title: "Login", url: "/login" },
    { title: "Register", url: "/register" },
  ];

  const isAuth = !isAuthenticated && !data?.data.userId;
  return (
    <>
      <Header links={isAuthenticated ? authLinks : unauthLinks} />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute redirect={isAuth} redirectTo="/login">
              <Trips />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addtrip"
          element={
            <ProtectedRoute redirect={isAuth} redirectTo="/login">
              <AddTrip />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trips/:tripId"
          element={
            <ProtectedRoute redirect={isAuth} redirectTo="/login">
              <TripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invites"
          element={
            <ProtectedRoute redirect={isAuth} redirectTo="/login">
              <InvitesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute redirect={!isAuth} redirectTo="/">
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute redirect={!isAuth} redirectTo="/">
              <Register />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ModalManager />
    </>
  );
}

export default App;
