/**
 * Runs a Zod schema against the request body and replaces it with the
 * parsed (trimmed, type-checked) result. On failure it returns 400 with
 * every field message, so the controller receives only valid data.
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return res.status(400).json({ message, errors: result.error.flatten().fieldErrors });
  }

  req.body = result.data;
  next();
};

export default validate;