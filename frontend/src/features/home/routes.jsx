import { AuthGuard } from "@/features/auth/index.js";
import HomePage from "./pages/HomePage.jsx";

export const homeRoutes = [
  {
    index: true,
    element: (
      <AuthGuard>
        <HomePage />
      </AuthGuard>
    ),
  },
];

export default homeRoutes;
