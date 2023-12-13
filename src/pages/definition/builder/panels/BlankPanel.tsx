import React from "react";

export default function BlankPanel({ message }) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#fafafd",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        {message || "Select a task by clicking on it in the Workflow Builder."}
      </div>
    </div>
  );
}
