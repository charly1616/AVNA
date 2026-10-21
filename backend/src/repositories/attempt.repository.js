import Attempt from "../models/attempt.model.js";

export const attemptRepository = {
  create(data) {
    return Attempt.create(data);
  },

  findById(attemptId) {
    return Attempt.findById(attemptId);
  },

  findByStudent(studentId) {
    return Attempt.find({ student: studentId })
      .sort({ createdAt: -1 })
      .select("-questions -answers");
  },

  async save(attempt) {
    return attempt.save();
  },
};

export default attemptRepository;
