/**
 * Activities feature public API.
 * Other modules and the app router should import only from here.
 */
export { useActivities, useActivity, activitiesKeys } from "./hooks/useActivities.js";
export {
  useCreateActivity,
  useUpdateActivity,
  useDeleteActivity,
  useSaveQuestions,
} from "./hooks/useActivityMutations.js";
export { useQuestionDraft } from "./hooks/useQuestionDraft.js";
export { ShareExamModal } from "./components/ShareExamModal.jsx";
export { activitiesRoutes } from "./routes.jsx";
