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

  findByActivity(activityId, { status } = {}) {
    const filter = { activity: activityId };
    if (status) filter.status = status;

    return Attempt.find(filter).sort({ createdAt: -1 });
  },

  async save(attempt) {
    return attempt.save();
  },
};

export default attemptRepository;
