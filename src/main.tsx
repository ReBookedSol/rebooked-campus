import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import "leaflet/dist/leaflet.css";
import "./index.css";

const CLERK_PUBLISHABLE_KEY = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY_SANDBOX || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY) as
  | string
  | undefined;

const root = createRoot(document.getElementById("root")!);

if (CLERK_PUBLISHABLE_KEY) {
  root.render(
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>,
  );
} else {
  root.render(<App />);
}
