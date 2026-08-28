// NotificationContext.jsx
import { createContext, useEffect, useState, useContext, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { initSocket } from "../socketClient";

export const NotificationContext = createContext();

export default function NotificationProvider({ children }) {
  const { user, token } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBell, setAnimateBell] = useState(false);

  // Load notification settings from localStorage
  const [settings, setSettings] = useState(() => ({
    mute: localStorage.getItem("notif_mute") === "true",
    sound: localStorage.getItem("notif_sound") !== "false",
    toast: localStorage.getItem("notif_toast") !== "false",
  }));

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("notif_mute", newSettings.mute);
    localStorage.setItem("notif_sound", newSettings.sound);
    localStorage.setItem("notif_toast", newSettings.toast);
  }, []);

  // Load notifications from API
  useEffect(() => {
    if (!user?._id || !token) return;

    const load = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data.data);

        const res2 = await api.get("/notifications/unread-count");
        setUnreadCount(res2.data.count);
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    load();
  }, [user?._id, token]);

  // Handle incoming real-time notifications
  const handleIncomingNotification = useCallback(
    (type, data) => {
      if (settings.mute) return;

      // Use real MongoDB ID + real read state + real createdAt
      const newNotification = {
        _id: data._id,
        type,
        message: data.message,
        payload: data.payload,
        createdAt: data.createdAt || new Date().toISOString(),
        read: data.read ?? false,
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play sound if enabled
      if (settings.sound) {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(err => {
          console.warn("Audio play blocked until user interacts:", err);
        });
      }

      // Show toast if enabled
      if (settings.toast) {
        toast.success(data.message);
      }

      setAnimateBell(true);
      setTimeout(() => setAnimateBell(false), 600);
    },
    [settings]
  );

  // Initialize socket listener
  useEffect(() => {
    if (!user?._id || !token) return;

    const socket = initSocket(token);
    if (!socket) return;

    socket.on("notification:new", (data) =>
      handleIncomingNotification(data.type || "notification:new", data)
    );

    return () => {
      socket.off("notification:new");
    };
  }, [user?._id, token, handleIncomingNotification]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, read: true } : n
        )
      );

      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch(`/notifications/read-all`);

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  // Delete single notification
  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  }, []);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    try {
      await api.delete(`/notifications`);

      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error("Error deleting all notifications:", err);
    }
  }, []);

  if (!user?._id) return children;

  // Button to enable sound (required by browser autoplay policy)
  function EnableSoundButton({ settings, saveSettings }) {
    const enableSound = () => {
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().then(() => {
        saveSettings({ ...settings, sound: true });
        console.log("🔊 Sound enabled");
      }).catch(err => {
        console.error("Audio play failed:", err);
      });
    };

    return (
      <button onClick={enableSound}>
        Enable Notification Sound
      </button>
    );
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        setNotifications,
        setUnreadCount,
        animateBell,
        settings,
        saveSettings,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
        EnableSoundButton, // exported to use in NotificationsPage
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
