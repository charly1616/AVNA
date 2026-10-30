import { createBrowserRouter } from "react-router";
import RootLayout from "./layouts/RootLayout.jsx";
import { authRoutes } from "@/features/auth/index.js";
import { activitiesRoutes } from "@/features/activities/index.js";
import { resultsRoutes } from "@/features/results/index.js";
import { homeRoutes } from "@/features/home/index.js";

/**
 * Central route composition.
 *
 * Each feature registers its own routes through its public index. The app
 * only composes them, so adding or removing a feature means editing this
 * file and the feature folder only.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      ...homeRoutes,        // index: HomePage ("/")
      ...activitiesRoutes,  // /manage, /manage/:activityId/edit
      ...resultsRoutes,     // /results
    ],
  },
  ...authRoutes,            // /login, /register (guest-guarded)
]);

export default router;
