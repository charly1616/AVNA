import Activity from "../models/activity.model.js";
import { createActivityCode, resolveActivityCode } from "../services/activityLink.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  findByCode(code) {
    return Activity.findOne({ code });
  },

  /**
   * Legacy activities keep the code inside their link. It is stored once so
   * every activity has a code from now on.
   */
  async setCodeIfMissing(activityId, code) {
    try {
      return await Activity.findOneAndUpdate(
        { _id: activityId, code: { $exists: false } },
        { $set: { code } },
        { new: true }
      );
    } catch (error) {
      // The code is already used by another activity: keep the old link.
      if (error?.code === 11000) return null;
      throw error;
    }
  },

  /**
   * Legacy activities have no code yet, so they are matched by the code
   * inside their link.
   *
   * The lookup is tolerant on purpose: the code can be typed in any case, the
   * title of the activity can be used instead of the code and the old links
   * (`https://.../actividades/<code>`) still open the activity.
   */
  async findByPublicCode(code) {
    const normalized = String(code ?? "").trim().toLowerCase();
    if (!normalized) return null;

    const exact = new RegExp(`^${escapeRegex(normalized)}$`, "i");

    const candidates = await Activity.find({
      $or: [
        { code: exact },
        { title: exact },
        { link: new RegExp(`/${escapeRegex(normalized)}$`, "i") },
        { code: { $exists: false } },
      ],
    }).limit(500);

    const found = this.pickActivity(candidates, normalized);
    if (found) return found;

    // The code can also be a title written with other spaces or accents.
    const word = normalized.split(/[^a-z0-9]+/).filter(Boolean)[0];
    if (!word) return null;

    const loose = await Activity.find({ title: new RegExp(escapeRegex(word), "i") }).limit(200);

    return this.pickActivity(loose, normalized);
  },

  /**
   * The activity that answers to a code: its own code first, then its title
   * and finally the code kept inside its link.
   */
  pickActivity(candidates, normalized) {
    const byCode = candidates.find(
      (activity) => resolveActivityCode(activity).toLowerCase() === normalized
    );
    if (byCode) return byCode;

    const slug = createActivityCode(normalized);
    const byTitle = candidates.find(
      (activity) => createActivityCode(activity.title).toLowerCase() === slug
    );
    if (byTitle) return byTitle;

    return (
      candidates.find((activity) => {
        const fromLink = String(activity.link ?? "")
          .split("/")
          .filter(Boolean)
          .pop()
          ?.toLowerCase();
        return fromLink === normalized;
      }) ?? null
    );
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