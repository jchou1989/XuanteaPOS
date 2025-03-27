import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { MenuProvider } from "./components/dashboard/MenuDataContext";
import { syncPendingTransactions } from "./lib/transactionService";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

// Set up global error handling
window.addEventListener("error", (event) => {
  console.error("Global error caught:", event.error);
  // Log to a service or store in localStorage for diagnostics
  try {
    const errors = JSON.parse(localStorage.getItem("app_errors") || "[]");
    errors.push({
      message: event.error?.message || "Unknown error",
      stack: event.error?.stack,
      timestamp: new Date().toISOString(),
    });
    // Keep only the last 50 errors
    if (errors.length > 50) errors.splice(0, errors.length - 50);
    localStorage.setItem("app_errors", JSON.stringify(errors));
  } catch (e) {
    console.error("Error logging error:", e);
  }
  // Don't prevent default to allow normal error handling
});

// Set up unhandled promise rejection handling
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
  // Log to a service or store in localStorage for diagnostics
  try {
    const errors = JSON.parse(localStorage.getItem("app_errors") || "[]");
    errors.push({
      message: event.reason?.message || "Unhandled promise rejection",
      stack: event.reason?.stack,
      timestamp: new Date().toISOString(),
    });
    // Keep only the last 50 errors
    if (errors.length > 50) errors.splice(0, errors.length - 50);
    localStorage.setItem("app_errors", JSON.stringify(errors));
  } catch (e) {
    console.error("Error logging rejection:", e);
  }
});

// Set up periodic sync of pending transactions
setInterval(
  () => {
    syncPendingTransactions().catch((error) => {
      console.error("Error in periodic transaction sync:", error);
    });
  },
  5 * 60 * 1000,
); // Every 5 minutes

// Set up periodic heartbeat to check system health
setInterval(() => {
  const timestamp = new Date().toISOString();
  localStorage.setItem("system_heartbeat", timestamp);
  console.log("System heartbeat:", timestamp);
}, 60 * 1000); // Every minute

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode className="max-w-fit max-h-fit">
    <BrowserRouter basename={basename}>
      <MenuProvider>
        <App />
      </MenuProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
