import React from "react";
import ReactDOM from "react-dom/client";
import Options from "./options/Options";
import { ThemeProvider } from "./components/theme-provider";

ReactDOM.createRoot(document.body).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="web-to-spread-theme">
      <Options />
    </ThemeProvider>
  </React.StrictMode>,
);
