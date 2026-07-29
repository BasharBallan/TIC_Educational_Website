import { useState } from "react";

function Counter() {
  // State to store the current counter value
  const [count, setCount] = useState(0);

  return (
    <div style={{ margin: "10px" }}>
      {/* Display the current counter value */}
      <h2>Counter: {count}</h2>

      {/* Increase the counter */}
      <button onClick={() => setCount(count + 1)}>
        Increase
      </button>

      {/* Decrease the counter */}
      <button
        onClick={() => setCount(count - 1)}
        style={{ marginLeft: "10px" }}
      >
        Decrease
      </button>
    </div>
  );
}

export default Counter;
