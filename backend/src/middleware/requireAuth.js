import authService from "../services/auth.service.js";
import teacherRepository from "../repositories/teacher.repository.js";
import { ENV } from "../config/env.js";

/**
 * Requires a valid JWT in the auth cookie. On success it attaches the
 * teacher document to `req.teacher` for the controller to use.
 *
 * Add this middleware to any route that should be private.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[ENV.cookie.name];
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const payload = authService.verifyToken(token);
    const teacher = await teacherRepository.findById(payload.sub);
    if (!teacher) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    req.teacher = teacher;
    next();
  } catch {
    // Expired or tampered token.
    authService.clearAuthCookie(res);
    return res.status(401).json({ message: "Not authenticated" });
  }
};

export default requireAuth;