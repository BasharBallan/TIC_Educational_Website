import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { NOTIFICATION_TYPES } from "../notificationTypes";

export default function NotificationDropdown() {
  const {
    notifications,
    markAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useContext(NotificationContext);

  return (
    <div
      style={{
        position: "absolute",
        top: "50px",
        right: "20px",
        width: "320px",
        background: "var(--bg)",
        borderRadius: "12px",
        boxShadow: "var(--shadow)",
        padding: "12px",
        zIndex: 999,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h4 style={{ margin: 0 }}>Notifications</h4>

        <button
          onClick={deleteAllNotifications}
          style={{
            background: "red",
            color: "white",
            border: "none",
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Clear All
        </button>
      </div>

      {notifications.length === 0 && <p>No notifications</p>}

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
              padding: "12px",
              borderBottom: "1px solid var(--border)",
              background: n.read ? "var(--social-bg)" : type.bg,
              borderRadius: "8px",
              marginBottom: "8px",
              cursor: "pointer",
              animation: "fadeIn 0.3s ease",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "22px",
                color: type.color,
              }}
            >
              {type.icon}
            </div>

            <div style={{ flex: 1 }} onClick={() => markAsRead(n._id)}>
              <strong style={{ color: "var(--text-h)" }}>
                {type.label}
              </strong>

              <p style={{ fontSize: "14px", color: "var(--text)" }}>
                {n.message}
              </p>

              <small style={{ color: "#777" }}>
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>

            <button
              onClick={() => deleteNotification(n._id)}
              style={{
                background: "#ff4d4d",
                color: "white",
                border: "none",
                padding: "5px 8px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "12px",
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
