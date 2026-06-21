import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import "./index.css";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
  | string
  | undefined;

const root = createRoot(document.getElementById("root")!);

if (!CLERK_PUBLISHABLE_KEY) {
  root.render(
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
        background: "#0f172a",
        color: "#e2e8f0",
      }}
    >
      <div style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 22, marginBottom: 12 }}>
          Clerk configuration required
        </h1>
        <p style={{ lineHeight: 1.5, opacity: 0.85 }}>
          The app is wired to use Clerk for authentication, but{" "}
          <code
            style={{
              background: "#1e293b",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            VITE_CLERK_PUBLISHABLE_KEY
          </code>{" "}
          is not set. Paste your Clerk publishable key (starts with{" "}
          <code>pk_test_</code> or <code>pk_live_</code>) into your project{" "}
          <code>.env</code> file and reload.
        </p>
      </div>
    </div>,
  );
} else {
  root.render(
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>,
  );
}
