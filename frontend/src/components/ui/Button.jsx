import { colors } from "../../styles/colors";

export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 18px",
        background: colors.primary,
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "500",
        transition: "0.2s",
      }}
    >
      {children}
    </button>
  );
}
