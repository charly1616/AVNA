import { useEffect } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import RootLayout from "./components/layout/RootLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import ManagePage from "./pages/ManagePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import { ProtectedRoute, RedirectIfAuthenticated } from "./components/routes/AuthRoutes.jsx";
import { useAuthStore } from "./store/useAuthStore.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "manage",
        element: <ManagePage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthenticated>
        <RegisterPage />
      </RedirectIfAuthenticated>
    ),
  },
]);

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

export default App;