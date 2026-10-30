import { RouterProvider } from "react-router";
import { Providers } from "./app/providers.jsx";
import { router } from "./app/router.jsx";

/**
 * Application root.
 * - Providers: TanStack Query client + auth bootstrap.
 * - RouterProvider: feature-composed router.
 */
export default function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}
