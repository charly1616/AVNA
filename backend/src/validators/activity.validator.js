import { z } from "zod";

const activityFields = {
  title: z.string().trim().min(1, "Activity title is required").max(80),
  description: z.string().trim().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a six-digit hex value").optional(),
  icon: z.enum(["book", "spell", "calculator", "palette", "bulb", "flask", "puzzle", "brain"]).optional(),
  link: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Link must use HTTP or HTTPS").optional(),
  active: z.boolean().optional(),
};

export const createActivitySchema = z.object({
  ...activityFields,
  link: activityFields.link,
}).strict();

export const updateActivitySchema = z.object(activityFields)
  .partial()
  .strict()
  .refine((activity) => Object.keys(activity).length > 0, "Provide at least one field to update");

export const activityIdSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid activity id"),
}).strict();

export const listActivitiesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

const mediaReferenceSchema = z.object({
  type: z.literal("image"),
  storageKey: z.string().trim().min(1).max(500).optional(),
  url: z.string().trim().url().refine((value) => /^https?:\/\//i.test(value), "Image URL must use HTTP or HTTPS").optional(),
  altText: z.string().trim().max(300).default(""),
  contentType: z.string().regex(/^image\//i).optional(),
  width: z.number().int().min(1).max(20000).optional(),
  height: z.number().int().min(1).max(20000).optional(),
}).strict().refine((media) => media.storageKey || media.url, {
  message: "An image must include a storage key or URL",
});

const mediaListSchema = z.array(mediaReferenceSchema).max(10).default([]);
const questionIdSchema = z.string().trim().min(1).max(80);
const questionTitleSchema = z.string().trim().max(120).default("");
const questionOrderSchema = z.number().int().min(0).default(0);
const textContentSchema = z.object({
  text: z.string().trim().max(500).default(""),
  media: mediaListSchema,
}).strict();
const requiredContentSchema = textContentSchema.refine(
  (content) => content.text.length > 0 || content.media.length > 0,
  "Content must include text or an image"
);

const commonQuestionFields = {
  id: questionIdSchema,
  title: questionTitleSchema,
  order: questionOrderSchema,
  media: mediaListSchema,
};

const abcQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("abc"),
  options: z.array(textContentSchema).min(2).max(100),
  correctOption: z.number().int().min(0),
}).strict();

const sortQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("sort"),
  items: z.array(textContentSchema).min(2).max(100),
}).strict();

const matchingPairSchema = z.object({
  left: textContentSchema,
  right: textContentSchema,
}).strict();

const linesQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("lines"),
  pairs: z.array(matchingPairSchema).min(2).max(100),
}).strict();

const conceptCardSchema = z.object({
  id: questionIdSchema,
  title: z.string().trim().min(1).max(120),
  question: requiredContentSchema,
  expectedAnswer: requiredContentSchema,
  media: mediaListSchema,
}).strict();

const conceptsQuestionSchema = z.object({
  ...commonQuestionFields,
  type: z.literal("concepts"),
  concepts: z.array(conceptCardSchema).min(2).max(4),
}).strict();

const questionSchema = z.discriminatedUnion("type", [
  abcQuestionSchema,
  sortQuestionSchema,
  linesQuestionSchema,
  conceptsQuestionSchema,
]);

export const replaceQuestionsSchema = z.object({
  questions: z.array(questionSchema).max(250),
}).strict().superRefine(({ questions }, context) => {
  const ids = new Set();
  questions.forEach((question, index) => {
    if (ids.has(question.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions", index, "id"],
        message: "Question IDs must be unique within an activity",
      });
    }
    ids.add(question.id);

    if (question.type === "abc" && question.correctOption >= question.options.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questions", index, "correctOption"],
        message: "Correct option must reference an existing option",
      });
    }

    if (question.type === "concepts") {
      const conceptIds = new Set();
      question.concepts.forEach((concept, conceptIndex) => {
        if (conceptIds.has(concept.id)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", index, "concepts", conceptIndex, "id"],
            message: "Concept card IDs must be unique within a question",
          });
        }
        conceptIds.add(concept.id);
      });
    }
  });
});