import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, trim: true },
    questionNumber: { type: Number, min: 1, default: 0 },
    type: { type: String, enum: ["abc", "sort", "lines", "concepts"], required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    isCorrect: { type: Boolean, default: false },
    timeSpentMs: { type: Number, min: 0, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: [true, "Activity is required"],
      index: true,
    },

    activityCode: { type: String, required: true, trim: true },
    activityTitle: { type: String, required: true, trim: true, maxlength: 80 },

    studentName: { type: String, required: true, trim: true, maxlength: 80 },
    studentEmail: { type: String, trim: true, lowercase: true, maxlength: 160, default: "" },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null, index: true },

    tokenHash: { type: String, required: true },

    status: { type: String, enum: ["in_progress", "submitted"], default: "in_progress" },

    /**
     * The questions as they were shown to the student, plus the private answer
     * key. Keeping the snapshot makes an attempt independent from later edits
     * of the activity.
     */
    questions: { type: [mongoose.Schema.Types.Mixed], default: [] },

    answers: { type: [answerSchema], default: [] },

    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },

    submittedAt: { type: Date, default: null },
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

attemptSchema.index({ activity: 1, createdAt: -1 });

export const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
