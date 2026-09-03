import { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { toast } from "sonner";

import {
  useGetVapidPublicKeyQuery,
  useSubscribeToPushMutation,
} from "../services/notificationApiSlice";
import {
  checkSubscriptionStatus,
  ensureServiceWorker,
  registerAndSubscribe,
} from "../utils/pushUtils";

export default function NotificationsPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: vapidData } = useGetVapidPublicKeyQuery();
  const [subscribeToPush] = useSubscribeToPushMutation();

  useEffect(() => {
    const isDismissed = sessionStorage.getItem("push_prompt_dismissed");
    if (isDismissed) return;

    const initialiseNotifications = async () => {
      try {
        if (!("Notification" in window)) return;
        if (Notification.permission === "denied") return;

        await ensureServiceWorker();
        const isSubscribed = await checkSubscriptionStatus();
        setShowPrompt(!isSubscribed);
      } catch (error) {
        console.error("Failed to check notification status:", error);
      }
    };

    initialiseNotifications();
  }, []);

  if (!showPrompt) {
    return null;
  }

  const handleSubscribe = async () => {
    if (!vapidData?.publicKey) {
      toast.error("VAPID public key not loaded yet. Please try again.");
      return;
    }

    setIsSubscribing(true);
    try {
      const subscriptionData = await registerAndSubscribe(vapidData.publicKey);
      await subscribeToPush(subscriptionData).unwrap();
      toast.success("Successfully subscribed to push notifications!");
      setShowPrompt(false);
    } catch (error: unknown) {
      console.error("Could not subscribe to push notifications:", error);
      const errMessage =
        error instanceof Error
          ? error.message
          : "Failed to subscribe to push notifications.";
      toast.error(errMessage);
    } finally {

      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem("push_prompt_dismissed", "true");
  };

  return (
    <div className="card p-4 fixed bottom-6 right-6 z-50 shadow-xl border border-brand-primary/20 max-w-sm animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-brand-primary">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-sm text-text-primary">
            Enable Push Notifications
          </h3>
        </div>
        <button
          onClick={handleDismiss}
          className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md"
          aria-label="Dismiss notification prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-text-muted mb-4 leading-relaxed">
        Stay updated on upcoming trip events, schedule reminders, and new member invitations.
      </p>
      <div className="flex items-center gap-2">
        <button
          className="btn-primary text-xs py-1.5 px-3 flex-1"
          onClick={handleSubscribe}
          disabled={isSubscribing}
        >
          {isSubscribing ? "Subscribing..." : "Enable Notifications"}
        </button>
        <button
          className="btn-secondary text-xs py-1.5 px-3"
          onClick={handleDismiss}
        >
          Later
        </button>
      </div>
    </div>
  );
}
