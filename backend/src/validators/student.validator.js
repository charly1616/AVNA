import { z } from "zod";

export const registerStudentSchema = z.object({
  name: z.string().trim().min(2, "Your name is required").max(80),
}).strict();
