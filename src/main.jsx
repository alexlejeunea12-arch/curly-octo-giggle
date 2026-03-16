import React from "react";
import ReactDOM from "react-dom/client";

const rootEl = document.getElementById("root");
const root = ReactDOM.createRoot(rootEl);

function showError(err) {
  const message =
    err?.stack ||
    err?.message ||
    (typeof err === "string" ? err : JSON.stringify(err, null, 2));

  console.error("ERREUR CAPTURÉE :", err);

  root.render(
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "#f8fafc",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
        whiteSpace: "pre-wrap",
      }}
    >
      <h1 style={{ marginTop: 0 }}>Erreur au chargement</h1>
      <pre
        style={{
          background: "#111827",
          padding: "16px",
          borderRadius: "12px",
          overflow: "auto",
        }}
      >
        {String(message)}
      </pre>
    </div>
  );
}

window.addEventListener("error", (event) => {
  showError(event.error || event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  showError(event.reason);
});

import("./App.jsx")
  .then(({ default: App }) => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(showError);
