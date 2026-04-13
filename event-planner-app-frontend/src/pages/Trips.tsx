import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import type { RootState } from "../store";

export default function Trips() {
  const userId = useSelector((state: RootState) => selectCurrentUser(state));
  console.log(userId);
  return <div>Trips</div>;
}
