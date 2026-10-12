import { Teacher } from "../models/teacher.model.js";

/**
 * Repository = the only place that talks to MongoDB.
 * Swapping Mongo for another database means rewriting this file only.
 */

export const teacherRepository = {
  async create({ name, password }) {
    return Teacher.create({ name, password });
  },

  findByName(name) {
    return Teacher.findOne({ name });
  },

  // password has `select: false`, so ask for it explicitly to compare.
  findByNameWithPassword(name) {
    return Teacher.findOne({ name }).select("+password");
  },

  findById(id) {
    return Teacher.findById(id);
  },

  async existsByName(name) {
    const found = await Teacher.findOne({ name }).select("_id").lean();
    return Boolean(found);
  },
};

export default teacherRepository;