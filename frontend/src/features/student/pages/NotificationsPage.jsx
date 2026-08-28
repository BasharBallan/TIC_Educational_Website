import { useContext } from "react";
import { NotificationContext } from "../../../context/NotificationContext";
import { NOTIFICATION_TYPES } from "../../../notificationTypes";

export default function NotificationsPage() {
  const {
    notifications,
    deleteNotification,
    deleteAllNotifications,
    markAsRead,
    settings,
    saveSettings,
  } = useContext(NotificationContext);

  if (!notifications || notifications.length === 0) {
    return <p style={{ padding: "30px" }}>No notifications</p>;
  }

  // Enable sound button (required due to browser autoplay policy)
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
    <div style={{ padding: "30px" }}>
      <h1>Notifications</h1>

      {/* Show Enable Sound button only if sound is disabled */}
      {!settings.sound && (
        <button
          onClick={enableSound}
          style={{
            background: "green",
            color: "white",
            padding: "10px 15px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Enable Sound
        </button>
      )}

      {/* Delete all notifications */}
      <button
        onClick={deleteAllNotifications}
        style={{
          background: "red",
          color: "white",
          padding: "10px 15px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          marginBottom: "20px",
          marginLeft: "10px",
        }}
      >
        Delete All
      </button>

      {notifications.map((n) => {
        const type = NOTIFICATION_TYPES[n.type] || {
          icon: "🔔",
          color: "#555",
          bg: "#eee",
          label: "Notification",
        };

        return (
          <div
            key={n._id}
            style={{
              background: n.read ? "var(--social-bg)" : type.bg,
              padding: "15px",
              marginBottom: "10px",
              borderRadius: "8px",
              boxShadow: "var(--shadow)",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              borderLeft: n.read ? "5px solid gray" : "5px solid green",
            }}
          >
            {/* Notification icon */}
            <div style={{ fontSize: "26px", color: type.color }}>
              {type.icon}
            </div>

            {/* Notification content */}
            <div
              style={{ flex: 1, cursor: "pointer" }}
              onClick={() => markAsRead(n._id)}
            >
              <h3>{type.label}</h3>
              <p>{n.message}</p>

              {/* Read / Unread indicator */}
              <small style={{ color: n.read ? "gray" : "green" }}>
                {n.read ? "Read" : "Unread"}
              </small>

              <br />

              {/* Date */}
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>

            {/* Delete single notification */}
            <button
              onClick={() => deleteNotification(n._id)}
              style={{
                background: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        );
      })}
    </div>
  );
}
