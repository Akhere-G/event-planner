import { Navigate, Route, Routes } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "react-tooltip/dist/react-tooltip.css";
import { Toaster } from "sonner";

import { useCheckUserQuery } from "./features/auth/services/authApiSlice";
import {
  selectIsAuthenticated,
  setCredentials,
} from "./features/auth/services/authSlice";
import { syncDOM } from "./features/theme/themeSlice";

import { Header, Footer, ErrorBoundary } from "./layout";

import RequireAuth from "./components/RequireAuth";
import RequireGuest from "./components/RequireGuest";
import { ErrorState, LoadingState } from "./components";

const AddTrip = lazy(() => import("./pages/AddTrip"));
const JoinTrip = lazy(() => import("./pages/JoinTrip"));
const InvitesPage = lazy(() => import("./pages/InvitesPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const TripPage = lazy(() => import("./pages/TripPage"));
const Trips = lazy(() => import("./pages/Trips"));
const Settings = lazy(() => import("./pages/Settings"));
const About = lazy(() => import("./pages/About"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));

import NotificationsPrompt from "./features/notifications/components/NotificationsPrompt";

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { isLoading, data } = useCheckUserQuery();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(syncDOM());
  }, [dispatch]);

  useEffect(() => {
    if (data?.data?.userId) {
      dispatch(setCredentials(data.data.userId));
    }
  }, [data, dispatch]);

  const isAuth = isAuthenticated || !!data?.data?.userId;

  const links = [{ title: "About", url: "/about" }];
  if (isAuth) {
    links.unshift(
      { title: "Trips", url: "/" },
      { title: "Add Trip", url: "/addtrip" },
      { title: "Invites", url: "/invites" },
    );
  } else {
    links.unshift(
      { title: "Login", url: "/login" },
      { title: "Register", url: "/register" },
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="container">
          <ErrorState showReload />
        </div>
      }
    >
      <Header links={links} />
      <Toaster position="top-right" richColors />
      {isAuth && <NotificationsPrompt />}


      <main className="min-h-[93.5vh] 2xl:min-h-[96vh]">
        <Suspense
          fallback={
            <div className="container">
              <LoadingState />
            </div>
          }
        >
          <Routes>
            <Route path="/about" element={<About />} />

            <Route
              path="/login"
              element={
                <RequireGuest isAuth={isAuth} isLoading={isLoading}>
                  <Login />
                </RequireGuest>
              }
            />
            <Route
              path="/register"
              element={
                <RequireGuest isAuth={isAuth} isLoading={isLoading}>
                  <Register />
                </RequireGuest>
              }
            />

            <Route
              path="/"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <Trips />
                </RequireAuth>
              }
            />
            <Route
              path="/addtrip"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <AddTrip />
                </RequireAuth>
              }
            />
            <Route
              path="/trips/:tripId"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <TripPage />
                </RequireAuth>
              }
            />
            <Route
              path="/invites"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <InvitesPage />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route
              path="/join/:token"
              element={
                <RequireAuth isAuth={isAuth} isLoading={isLoading}>
                  <JoinTrip />
                </RequireAuth>
              }
            />

            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>

      <Footer isAuthenticated={isAuth} />
    </ErrorBoundary>
  );
}

export default App;
