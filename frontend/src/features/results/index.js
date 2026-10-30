/**
 * Results feature public API.
 * Other modules and the app router should import only from here.
 */
export {
  useActivityResults,
  useAttemptResult,
  resultsKeys,
} from "./hooks/useActivityResults.js";
export { useUpdateAnswerCorrectness } from "./hooks/useUpdateAnswerCorrectness.js";
export { resultsRoutes } from "./routes.jsx";
