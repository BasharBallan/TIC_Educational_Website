export default function Error({ message = "Something went wrong" }) {
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h3 style={styles.title}>⚠️ Error</h3>
        <p style={styles.msg}>{message}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px 0",
    display: "flex",
    justifyContent: "center",
  },
  box: {
    background: "#ffe6e6",
    border: "1px solid #ffb3b3",
    padding: "20px 25px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    marginBottom: "10px",
    color: "#cc0000",
    fontSize: "20px",
    fontWeight: "600",
  },
  msg: {
    margin: 0,
    color: "#660000",
    fontSize: "16px",
  },
};
