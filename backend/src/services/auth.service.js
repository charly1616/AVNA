import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import teacherRepository from "../repositories/teacher.repository.js";

/**
 * Business rules live here: what counts as a valid login, what a public
 * teacher object looks like, and how the auth cookie is written.
 */

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Never expose the password hash - only this shape leaves the API. */
const toPublicTeacher = (teacher) => ({
  id: teacher._id.toString(),
  name: teacher.name,
  role: teacher.role,
  createdAt: teacher.createdAt,
});

const cookieOptions = () => ({
  httpOnly: true,
  secure: ENV.cookie.secure,
  sameSite: ENV.cookie.sameSite,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, aligned with JWT_EXPIRES_IN default
  path: "/",
});

export const authService = {
  HttpError,

  async register({ name, password }) {
    const alreadyExists = await teacherRepository.existsByName(name);
    if (alreadyExists) {
      throw new HttpError(409, "That name is already taken");
    }

    // The model hashes the password on save.
    const teacher = await teacherRepository.create({ name, password });
    return toPublicTeacher(teacher);
  },

  async login({ name, password }) {
    const teacher = await teacherRepository.findByNameWithPassword(name);

    // Same message for "no such name" and "wrong password" so the API
    // cannot be used to discover which teacher names exist.
    if (!teacher) {
      throw new HttpError(401, "Invalid name or password");
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      throw new HttpError(401, "Invalid name or password");
    }

    if (!teacher.isActive) {
      throw new HttpError(403, "This account has been disabled");
    }

    return toPublicTeacher(teacher);
  },

  signToken(teacherId) {
    return jwt.sign({ sub: teacherId }, ENV.jwtSecret, {
      expiresIn: ENV.jwtExpiresIn,
    });
  },

  setAuthCookie(res, teacherId) {
    res.cookie(ENV.cookie.name, this.signToken(teacherId), cookieOptions());
  },

  clearAuthCookie(res) {
    res.clearCookie(ENV.cookie.name, { ...cookieOptions(), maxAge: undefined });
  },

  verifyToken(token) {
    return jwt.verify(token, ENV.jwtSecret);
  },
};

export default authService;