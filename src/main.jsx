import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router.jsx";

const mountPoint = document.getElementById("root");

if (!mountPoint) {
  throw new Error('Could not find the app mount point "#root".');
}

createRoot(mountPoint).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
