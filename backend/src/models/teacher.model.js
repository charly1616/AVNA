import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ENV } from "../config/env.js";

/**
 * Database schema for a teacher account.
 *
 * Password handling lives in the model (pre-save hook + comparePassword)
 * so no other layer ever has to remember to hash or verify.
 */
const teacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [60, "Name must be at most 60 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      // Never ship the hash to the client.
      select: false,
    },

    role: {
      type: String,
      enum: ["teacher"],
      default: "teacher",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Hash the password automatically whenever it is set or changed.
teacherSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, ENV.bcryptSaltRounds);
  next();
});

teacherSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const Teacher = mongoose.model("Teacher", teacherSchema);
export default Teacher;