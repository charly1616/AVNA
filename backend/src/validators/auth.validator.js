import { z } from "zod";

/**
 * Input schemas. These run in the `validate` middleware before a request
 * reaches the controller, so controllers can assume the shape is correct.
 * Change a rule here and it applies everywhere.
 */

const nameField = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(60, "Name must be at most 60 characters");

const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(72, "Password must be at most 72 characters"); // bcrypt limit

export const registerSchema = z.object({
  name: nameField,
  password: passwordField,
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  name: nameField,
  password: z.string().min(1, "Password is required").max(72),
});

export default { registerSchema, loginSchema };