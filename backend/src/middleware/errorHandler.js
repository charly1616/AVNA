import { ENV } from "../config/env.js";

/**
 * Last middleware in the stack. Controllers `throw` instead of building
 * error responses, so every failure funnels through here.
 */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (error, req, res, next) => {
  const status = error.status ?? 500;
  const message = status === 500 ? "Internal server error" : error.message;

  if (status === 500) console.error("[error]", error);

  res.status(status).json({
    message,
    ...(ENV.isProduction ? {} : { stack: error.stack }),
  });
};

export default errorHandler;