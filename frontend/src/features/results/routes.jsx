import { AuthGuard } from "@/features/auth/index.js";
import ResultsPage from "./pages/ResultsPage.jsx";

export const resultsRoutes = [
  {
    path: "results",
    element: (
      <AuthGuard>
        <ResultsPage />
      </AuthGuard>
    ),
  },
];

export default resultsRoutes;
