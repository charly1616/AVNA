import activityRepository from "../repositories/activity.repository.js";
import createActivityLink from "./activityLink.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const activityService = {
  async create(teacherId, data) {
    return activityRepository.create(teacherId, {
      ...data,
      link: createActivityLink(data.title),
    });
  },

  async list(teacherId, { page, limit }) {
    const { activities, total } = await activityRepository.findByTeacherId(teacherId, {
      skip: (page - 1) * limit,
      limit,
    });

    return {
      activities: activities.map((activity) => ({
        ...activity.toJSON(),
        link: createActivityLink(activity.title),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async get(teacherId, activityId) {
    const activity = await activityRepository.findByIdForTeacher(activityId, teacherId);
    if (!activity) throw new HttpError(404, "Activity not found");
    return activity;
  },

  async update(teacherId, activityId, changes) {
    const updatedChanges = changes.title
      ? { ...changes, link: createActivityLink(changes.title) }
      : changes;
    const activity = await activityRepository.updateByIdForTeacher(activityId, teacherId, updatedChanges);
    if (!activity) throw new HttpError(404, "Activity not found");
    return activity;
  },

  async replaceQuestions(teacherId, activityId, questions) {
    const activity = await activityRepository.replaceQuestionsForTeacher(activityId, teacherId, questions);
    if (!activity) throw new HttpError(404, "Activity not found");
    return activity;
  },

  async delete(teacherId, activityId) {
    const activity = await activityRepository.deleteByIdForTeacher(activityId, teacherId);
    if (!activity) throw new HttpError(404, "Activity not found");
  },
};

export default activityService;