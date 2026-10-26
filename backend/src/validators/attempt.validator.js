import { z } from "zod";

/**
 * The code of an activity is a slug ("la-celula"), but the title is accepted
 * too ("La célula"), so any activity can be opened the way it is written.
 */
const activityCodeField = z
  .string()
  .trim()
  .min(3, "Código de actividad inválido")
  .max(120)
  .regex(/^[A-Za-z0-9 _.\-áéíóúüñÁÉÍÓÚÜÑ]+$/, "Código de actividad inválido");

export const activityCodeSchema = z.object({
  code: activityCodeField,
}).strict();

export const activityQuestionSchema = z.object({
  code: activityCodeField,
  number: z.coerce.number().int().min(1, "Invalid question number").max(500),
}).strict();

export const startAttemptSchema = z
  .object({
    studentName: z.string().trim().min(1, "Your name is required").max(80).optional(),
    studentEmail: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(160)
      .optional()
      .or(z.literal("")),
    studentToken: z.string().trim().min(16).max(128).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (!value.studentName && !value.studentToken) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentName"],
        message: "Indicate your name or register to start",
      });
    }
  });

const questionKey = {
  questionNumber: z.number().int().min(1).max(500).optional(),
  questionId: z.string().trim().min(1).max(80).optional(),
};

const timeSpent = z.number().int().min(0).max(86_400_000).optional();

const abcAnswerSchema = z.object({
  type: z.literal("abc"),
  ...questionKey,
  value: z.object({ optionId: z.string().trim().min(1).max(64) }).strict(),
  timeSpentMs: timeSpent,
}).strict();

const sortAnswerSchema = z.object({
  type: z.literal("sort"),
  ...questionKey,
  value: z.object({ order: z.array(z.string().trim().min(1).max(64)).min(1).max(100) }).strict(),
  timeSpentMs: timeSpent,
}).strict();

const linesAnswerSchema = z.object({
  type: z.literal("lines"),
  ...questionKey,
  value: z
    .object({
      matches: z
        .array(z.object({ leftId: z.string().trim().min(1).max(64), rightId: z.string().trim().min(1).max(64) }).strict())
        .min(1)
        .max(100),
    })
    .strict(),
  timeSpentMs: timeSpent,
}).strict();

const conceptsAnswerSchema = z.object({
  type: z.literal("concepts"),
  ...questionKey,
  value: z
    .object({
      cards: z
        .array(
          z.object({ cardId: z.string().trim().min(1).max(80), text: z.string().trim().max(500) }).strict()
        )
        .min(1)
        .max(10),
    })
    .strict(),
  timeSpentMs: timeSpent,
}).strict();

export const logAnswerSchema = z
  .discriminatedUnion("type", [
    abcAnswerSchema,
    sortAnswerSchema,
    linesAnswerSchema,
    conceptsAnswerSchema,
  ])
  .superRefine((answer, context) => {
    if (answer.questionNumber === undefined && answer.questionId === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionNumber"],
        message: "Indicate the question number or the question id",
      });
    }
  });

export const attemptIdSchema = z.object({
  attemptId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid attempt id"),
}).strict();

export const checkAnswerSchema = z
  .object({
    questionId: z.string().trim().min(1, "Question id is required").max(80),
    cardId: z.string().trim().min(1).max(80).optional(),
    answer: z
      .string()
      .trim()
      .min(1, "La respuesta no puede estar vacía")
      .max(2500, "La respuesta es demasiado larga"),
  })
  .strict();
