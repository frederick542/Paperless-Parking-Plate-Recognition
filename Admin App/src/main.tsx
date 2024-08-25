import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./utils/context/authContext.tsx";
import { LoadingProvider } from "./utils/context/loadingContext.tsx";
import { ModalProvider } from "./hooks/modalHooks.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ModalProvider>
      <LoadingProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LoadingProvider>
    </ModalProvider>
  </StrictMode>,
);
