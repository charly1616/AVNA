import mongoose from "mongoose";

/**
 * A student of the public quiz. There is no password: the identity is the
 * name, and the token returned when registering is what links the browser to
 * that student.
 */
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
      maxlength: [80, "Student name must be at most 80 characters"],
    },

    /**
     * Lowercased name, used to recognise the same student when they come back.
     */
    nameKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    /**
     * Hashes of the tokens handed out to this student. Several devices can be
     * signed in at the same time, and every token can be revoked by signing in
     * again.
     */
    tokenHashes: { type: [String], default: [] },
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

studentSchema.index({ nameKey: 1 }, { unique: true });

export const Student = mongoose.model("Student", studentSchema);
export default Student;
