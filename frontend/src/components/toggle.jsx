import { useState } from "react";

function Toggle() {
  // State to control whether the text is visible or hidden
  const [show, setShow] = useState(false);

  return (
    <div style={{ margin: "10px" }}>
      {/* Toggle the visibility of the text */}
      <button onClick={() => setShow(!show)}>
        Toggle Text
      </button>

      {/* Conditionally render the text only when 'show' is true */}
      {show && (
        <p style={{ marginTop: "10px" }}>
          This text is toggled!
        </p>
      )}
    </div>
  );
}

export default Toggle;
