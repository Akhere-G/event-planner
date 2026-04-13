import { Navigate, Route, Routes } from "react-router";
import { Login, Register, TripDetails, Trips } from "./pages";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Trips />} />
        <Route path="/trip/:tripId" element={<TripDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
