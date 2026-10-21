import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import attemptRepository from "../repositories/attempt.repository.js";
import studentRepository from "../repositories/student.repository.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const hashToken = (token) => createHash("sha256").update(String(token)).digest("hex");

const isValidToken = (student, token) => {
  if (!token) return false;

  const provided = Buffer.from(hashToken(token));

  return student.tokenHashes.some((stored) => {
    const expected = Buffer.from(stored);
    return provided.length === expected.length && timingSafeEqual(provided, expected);
  });
};

/**
 * The name is the identity of a student: "Ana" and "ana" are the same person.
 */
export const toNameKey = (name) => String(name ?? "").trim().replace(/\s+/g, " ").toLowerCase();

export const studentService = {
  /**
   * Registers a student with just their name. When the name is already known a
   * new token is issued, so the student can come back from another device
   * without losing the previous one.
   */
  async register(name) {
    const nameKey = toNameKey(name);
    const token = randomBytes(24).toString("hex");
    const tokenHash = hashToken(token);

    const existing = await studentRepository.findByNameKey(nameKey);
    if (existing) {
      const student = await studentRepository.addToken(existing._id, tokenHash);
      return { id: student._id.toString(), name: student.name, token };
    }

    try {
      const student = await studentRepository.create({ name, nameKey, tokenHashes: [tokenHash] });
      return { id: student._id.toString(), name: student.name, token };
    } catch (error) {
      // Two registrations of the same name at the same time.
      if (error?.code === 11000) {
        const student = await studentRepository.addToken(
          (await studentRepository.findByNameKey(nameKey))._id,
          tokenHash
        );
        return { id: student._id.toString(), name: student.name, token };
      }

      throw error;
    }
  },

  /**
   * The student behind a token.
   */
  async getByToken(token) {
    if (!token) return null;

    const student = await studentRepository.findByTokenHash(hashToken(token));
    if (!student || !isValidToken(student, token)) return null;

    return student;
  },

  async getMe(token) {
    const student = await this.getByToken(token);
    if (!student) throw new HttpError(401, "Not registered");

    const attempts = await attemptRepository.findByStudent(student._id);

    return {
      id: student._id.toString(),
      name: student.name,
      registeredAt: student.createdAt,
      attempts: attempts.map((attempt) => ({
        id: attempt._id.toString(),
        activityCode: attempt.activityCode,
        activityTitle: attempt.activityTitle,
        status: attempt.status,
        score: attempt.score,
        total: attempt.total,
        percent: attempt.total === 0 ? 0 : Math.round((attempt.score / attempt.total) * 100),
        startedAt: attempt.createdAt,
        submittedAt: attempt.submittedAt,
      })),
    };
  },
};

export default studentService;
