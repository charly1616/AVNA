import Student from "../models/student.model.js";

const MAX_TOKENS = 10;

export const studentRepository = {
  create(data) {
    return Student.create(data);
  },

  findByNameKey(nameKey) {
    return Student.findOne({ nameKey });
  },

  findById(studentId) {
    return Student.findById(studentId);
  },

  findByTokenHash(tokenHash) {
    return Student.findOne({ tokenHashes: tokenHash });
  },

  /**
   * Adds a token to the student, keeping the newest ones.
   */
  async addToken(studentId, tokenHash) {
    const student = await Student.findById(studentId);
    if (!student) return null;

    student.tokenHashes = [tokenHash, ...student.tokenHashes.filter((hash) => hash !== tokenHash)].slice(
      0,
      MAX_TOKENS
    );
    await student.save();

    return student;
  },
};

export default studentRepository;
