import authService from "../services/auth.service.js";

/**
 * Controllers only translate HTTP <-> service calls.
 * No database access and no business rules here.
 */

export const register = async (req, res) => {
  const { name, password } = req.body;
  const teacher = await authService.register({ name, password });

  authService.setAuthCookie(req, res, teacher.id);
  res.status(201).json({ teacher });
};

export const login = async (req, res) => {
  const { name, password } = req.body;
  const teacher = await authService.login({ name, password });

  authService.setAuthCookie(req, res, teacher.id);
  res.status(200).json({ teacher });
};

export const logout = async (req, res) => {
  authService.clearAuthCookie(req, res);
  res.status(200).json({ message: "Logged out" });
};

/** Used by the frontend to restore the session on page reload. */
export const me = async (req, res) => {
  res.status(200).json({ teacher: req.teacher });
};