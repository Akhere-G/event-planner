import { useDispatch } from "react-redux";
import { setCredentials } from "../features/auth/services/authSlice";
import { usePostHog } from "@posthog/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useDemoLoginMutation } from "../features/auth/services/authApiSlice";

export default function useDemoButton() {
  const [demoLogin, demoResult] = useDemoLoginMutation();
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const navigate = useNavigate();

  const onTryDemo = async () => {
    try {
      const result = await demoLogin().unwrap();
      dispatch(setCredentials({ id: result.data.id, isDemo: true }));
      posthog?.capture("user_logged_in", {
        user_id: result.data.id,
        signin_method: "demo",
      });
      toast.success("Welcome! You're exploring a shared demo trip.");
      navigate("/");
    } catch (err) {
      posthog?.captureException(err);
      toast.error("Couldn't start the demo. Please try again.");
    }
  };

  return { onTryDemo, demoResult };
}
