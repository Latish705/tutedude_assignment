import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { DialogProvider } from "./contexts/DialogContext.tsx";

createRoot(document.getElementById("root")!).render(
  <Router>
    <AuthProvider>
      <DialogProvider>
        <App />
      </DialogProvider>
    </AuthProvider>
  </Router>
);
