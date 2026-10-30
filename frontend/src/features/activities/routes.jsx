import { AuthGuard } from "@/features/auth/index.js";
import ManagePage from "./pages/ManagePage.jsx";
import EditActivityPage from "./pages/EditActivityPage.jsx";

/**
 * Activities feature routes. Registered lazily by the app router.
 */
export const activitiesRoutes = [
  {
    path: "manage",
    element: (
      <AuthGuard>
        <ManagePage />
      </AuthGuard>
    ),
  },
  {
    path: "manage/:activityId/edit",
    element: (
      <AuthGuard>
        <EditActivityPage />
      </AuthGuard>
    ),
  },
];

export default activitiesRoutes;
