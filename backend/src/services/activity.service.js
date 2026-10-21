import activityRepository from "../repositories/activity.repository.js";
import { buildActivityLink, createActivityCode, resolveActivityCode } from "./activityLink.js";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Two activities with the same title would produce the same code, so a number
 * is added until the code is free.
 */
const resolveUniqueCode = async (title) => {
  const base = createActivityCode(title);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const code = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const existing = await activityRepository.findByCode(code);
    if (!existing) return code;
  }

  throw new HttpError(409, "Could not generate a unique code for this activity");
};

export const activityService = {
  async create(teacherId, data) {
    const code = await resolveUniqueCode(data.title);

    return activityRepository.create(teacherId, {
      ...data,
      code,
      link: buildActivityLink(code),
    });
  },

  async list(teacherId, { page, limit }) {
    const { activities, total } = await activityRepository.findByTeacherId(teacherId, {
      skip: (page - 1) * limit,
      limit,
    });

    return {
      activities: await Promise.all(
        activities.map(async (activity) => {
          const code = await activityRepository.setCodeIfMissing(activity._id, resolveActivityCode(activity));

          return {
            ...activity.toJSON(),
            code: code?.code ?? resolveActivityCode(activity),
            link: buildActivityLink(code?.code ?? resolveActivityCode(activity)),
          };
        })
      ),
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

    const code = resolveActivityCode(activity);

    return { ...activity.toJSON(), code, link: buildActivityLink(code) };
  },

  async update(teacherId, activityId, changes) {
    let updatedChanges = changes;

    if (changes.title) {
      const code = await resolveUniqueCode(changes.title);
      updatedChanges = { ...changes, code, link: buildActivityLink(code) };
    }

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
