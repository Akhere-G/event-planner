import { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, ExternalLink, Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { formatDistanceToNow, parseISO } from "date-fns";
import { toast } from "sonner";

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "../services/notificationApiSlice";
import type { NotificationItem } from "../types";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data, isLoading } = useGetNotificationsQuery(undefined, {
    pollingInterval: 30000,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markAsRead(item.id).unwrap();
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
    if (item.linkUrl) {
      navigate(item.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to update notifications.");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-canvas transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-brand-primary/20 bg-canvas shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-3 border-b border-brand-primary/10 flex items-center justify-between bg-canvas/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-brand-primary/5">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-text-muted">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-text-muted gap-2">
                <Inbox className="w-8 h-8 opacity-40" />
                <p className="text-xs">No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-3 text-left transition-colors cursor-pointer hover:bg-brand-primary/5 flex items-start gap-3 ${
                    !item.isRead ? "bg-brand-primary/5" : ""
                  }`}
                >
                  <div
                    className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                      !item.isRead ? "bg-brand-primary" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-text-primary truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-text-muted shrink-0">
                        {formatDistanceToNow(parseISO(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    {item.linkUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-brand-primary font-medium mt-1">
                        View details
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
