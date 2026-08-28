import { useContext } from "react";
import { NotificationContext } from "../../../context/NotificationContext";

export default function NotificationSettings() {
  const { settings, saveSettings } = useContext(NotificationContext);

  const update = (key, value) => {
    saveSettings({ ...settings, [key]: value });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>Notification Settings</h1>

      <div
        style={{
          background: "var(--social-bg)",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "var(--shadow)",
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        {/* Mute */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "18px" }}>
            <input
              type="checkbox"
              checked={settings.mute}
              onChange={(e) => update("mute", e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            🔕 Mute All Notifications
          </label>
        </div>

        {/* Sound */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "18px" }}>
            <input
              type="checkbox"
              checked={settings.sound}
              onChange={(e) => update("sound", e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            🔊 Enable Notification Sound
          </label>
        </div>

        {/* Toast */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "18px" }}>
            <input
              type="checkbox"
              checked={settings.toast}
              onChange={(e) => update("toast", e.target.checked)}
              style={{ marginRight: "10px" }}
            />
            ✨ Enable Toast Popups
          </label>
        </div>
      </div>
    </div>
  );
}
