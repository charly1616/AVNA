import { Router } from "express";
import * as activityController from "../controllers/activity.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { validate } from "../middleware/validate.js";
import {
  activityIdSchema,
  createActivitySchema,
  listActivitiesQuerySchema,
  replaceQuestionsSchema,
  updateActivitySchema,
} from "../validators/activity.validator.js";

const router = Router();

router.use(requireAuth);

router.post("/", validate(createActivitySchema), asyncHandler(activityController.create));
router.get("/", validate(listActivitiesQuerySchema, "query"), asyncHandler(activityController.list));
router.get("/:id", validate(activityIdSchema, "params"), asyncHandler(activityController.get));
router.patch(
  "/:id",
  validate(activityIdSchema, "params"),
  validate(updateActivitySchema),
  asyncHandler(activityController.update)
);
router.put(
  "/:id/questions",
  validate(activityIdSchema, "params"),
  validate(replaceQuestionsSchema),
  asyncHandler(activityController.replaceQuestions)
);
router.delete("/:id", validate(activityIdSchema, "params"), asyncHandler(activityController.remove));

export default router;