import { Router } from "express";
import rateLimit from "express-rate-limit";

import * as attemptController from "../controllers/attempt.controller.js";
import * as studentController from "../controllers/student.controller.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  activityCodeSchema,
  activityQuestionSchema,
  attemptIdSchema,
  logAnswerSchema,
  startAttemptSchema,
} from "../validators/attempt.validator.js";
import { registerStudentSchema } from "../validators/student.validator.js";

const router = Router();

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

router.use(publicLimiter);

router.post(
  "/students",
  validate(registerStudentSchema),
  asyncHandler(studentController.register)
);

router.get(
  "/students/me",
  asyncHandler(studentController.me)
);

router.get(
  "/activities/:code",
  validate(activityCodeSchema, "params"),
  asyncHandler(attemptController.getActivity)
);

router.get(
  "/activities/:code/questions",
  validate(activityCodeSchema, "params"),
  asyncHandler(attemptController.getQuestions)
);

router.get(
  "/activities/:code/questions/:number",
  validate(activityQuestionSchema, "params"),
  asyncHandler(attemptController.getQuestion)
);

router.post(
  "/activities/:code/attempts",
  validate(activityCodeSchema, "params"),
  validate(startAttemptSchema),
  asyncHandler(attemptController.start)
);

router.put(
  "/attempts/:attemptId/answers",
  validate(attemptIdSchema, "params"),
  validate(logAnswerSchema),
  asyncHandler(attemptController.logAnswer)
);

router.post(
  "/attempts/:attemptId/submit",
  validate(attemptIdSchema, "params"),
  asyncHandler(attemptController.submit)
);

router.get(
  "/attempts/:attemptId",
  validate(attemptIdSchema, "params"),
  asyncHandler(attemptController.getAttempt)
);

export default router;
