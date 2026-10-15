import Activity from "../models/activity.model.js";

export const activityRepository = {
  create(teacherId, data) {
    return Activity.create({ ...data, teacher: teacherId });
  },

  async findByTeacherId(teacherId, { skip, limit }) {
    const filter = { teacher: teacherId };
    const [activities, total] = await Promise.all([
      Activity.find(filter).select("-questions").sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit),
      Activity.countDocuments(filter),
    ]);

    return { activities, total };
  },

  findByIdForTeacher(activityId, teacherId) {
    return Activity.findOne({ _id: activityId, teacher: teacherId });
  },

  updateByIdForTeacher(activityId, teacherId, changes) {
    return Activity.findOneAndUpdate(
      { _id: activityId, teacher: teacherId },
      { $set: changes },
      { new: true, runValidators: true }
    );
  },

  replaceQuestionsForTeacher(activityId, teacherId, questions) {
    return Activity.findOneAndUpdate(
      { _id: activityId, teacher: teacherId },
      { $set: { questions } },
      { new: true, runValidators: true }
    );
  },

  deleteByIdForTeacher(activityId, teacherId) {
    return Activity.findOneAndDelete({ _id: activityId, teacher: teacherId });
  },
};

export default activityRepository;