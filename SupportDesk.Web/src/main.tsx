import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import App from "./App.tsx";

import {
  AuthProvider,
} from "./contexts/AuthContext";

import {
  ToastProvider,
} from "./contexts/ToastContext";

import {
  ConfirmProvider,
} from "./contexts/ConfirmContext";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>
);
