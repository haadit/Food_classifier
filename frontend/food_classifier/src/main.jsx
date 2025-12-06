import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import HistoryDetailPage from "./pages/HistoryDetailPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import { AuthProvider } from "./contexts/AuthContext";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/history", element: <HistoryPage /> },
  { path: "/history/:id", element: <HistoryDetailPage /> },
  { path: "/recipes/:slug", element: <RecipesPage /> },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>
);
