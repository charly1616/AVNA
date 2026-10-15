/**
 * Runs a Zod schema against a request source. Parsed body data replaces the
 * body; params and query data are stored separately to avoid mutating Express
 * request getters. Controllers receive only validated data.
 */
export const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(", ");

    return res.status(400).json({ message, errors: result.error.flatten().fieldErrors });
  }

  if (source === "body") {
    req.body = result.data;
  } else {
    req.validated ??= {};
    req.validated[source] = result.data;
  }
  next();
};

export default validate;