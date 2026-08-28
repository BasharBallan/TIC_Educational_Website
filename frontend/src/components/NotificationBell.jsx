import { useState, useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

export default function NotificationBell() {
  const { unreadCount, animateBell } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          fontSize: "28px",
          cursor: "pointer",
          transition: "transform 0.3s",
          transform: animateBell ? "scale(1.3)" : "scale(1)",
          color: unreadCount > 0 ? "var(--accent)" : "var(--text-h)",
        }}
        onClick={() => setOpen(!open)}
      >
        🔔
      </span>

      {unreadCount > 0 && (
        <span
          className="badge-animate"
          style={{
            position: "absolute",
            top: "-5px",
            right: "-5px",
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "4px 7px",
            fontSize: "12px",
          }}
        >
          {unreadCount}
        </span>
      )}

      {open && <NotificationDropdown />}
    </div>
  );
}
