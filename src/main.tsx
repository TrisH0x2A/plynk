import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import { QueryProvider } from "./components/providers/query-provider";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryProvider>
      <App />
    </QueryProvider>
  </React.StrictMode>
);
