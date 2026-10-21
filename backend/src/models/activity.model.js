import mongoose from "mongoose";

const mediaReferenceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image"], required: true },
    storageKey: { type: String, trim: true, maxlength: 500 },
    url: { type: String, trim: true, maxlength: 2048, match: /^https?:\/\//i },
    altText: { type: String, trim: true, maxlength: 300, default: "" },
    contentType: { type: String, match: /^image\//i },
    width: { type: Number, min: 1, max: 20000 },
    height: { type: Number, min: 1, max: 20000 },
  },
  { _id: false }
);

mediaReferenceSchema.pre("validate", function validateImageReference() {
  if (!this.storageKey && !this.url) {
    this.invalidate("storageKey", "An image must reference a storage key or URL");
  }
});

const contentPartSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 500, default: "" },
    media: { type: [mediaReferenceSchema], default: [] },
  },
  { _id: false }
);

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 500, default: "" },
    media: { type: [mediaReferenceSchema], default: [] },
  },
  { _id: false }
);

const sortableItemSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 500, default: "" },
    media: { type: [mediaReferenceSchema], default: [] },
  },
  { _id: false }
);

const matchingPairSchema = new mongoose.Schema(
  {
    left: { type: contentPartSchema, required: true },
    right: { type: contentPartSchema, required: true },
  },
  { _id: false }
);

const conceptCardSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    question: { type: contentPartSchema, required: true },
    expectedAnswer: { type: contentPartSchema, required: true },
    media: { type: [mediaReferenceSchema], default: [] },
  },
  { _id: false }
);

const activityQuestionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true, maxlength: 80 },
    type: { type: String, enum: ["abc", "sort", "lines", "concepts"], required: true },
    title: { type: String, trim: true, maxlength: 120, default: "" },
    order: { type: Number, min: 0, default: 0 },
    media: { type: [mediaReferenceSchema], default: [] },
    options: { type: [optionSchema], default: undefined },
    correctOption: { type: Number, min: 0 },
    items: { type: [sortableItemSchema], default: undefined },
    pairs: { type: [matchingPairSchema], default: undefined },
    concepts: { type: [conceptCardSchema], default: undefined },
  },
  { _id: false }
);

activityQuestionSchema.pre("validate", function validateQuestionType() {
  if (this.type === "abc") {
    if (!this.options || this.options.length < 2) {
      this.invalidate("options", "ABCD questions require at least two options");
    }
    if (!Number.isInteger(this.correctOption) || this.correctOption >= (this.options?.length ?? 0)) {
      this.invalidate("correctOption", "The correct option must reference an existing option");
    }
  }

  if (this.type === "sort" && (!this.items || this.items.length < 2)) {
    this.invalidate("items", "Ordering questions require at least two items");
  }

  if (this.type === "lines" && (!this.pairs || this.pairs.length < 2)) {
    this.invalidate("pairs", "Matching questions require at least two pairs");
  }

  if (this.type === "concepts" && (!this.concepts || this.concepts.length < 2 || this.concepts.length > 4)) {
    this.invalidate("concepts", "Concept questions require between two and four cards");
  }
});

activityQuestionSchema.pre("validate", function validateUniqueConceptCardIds() {
  if (this.type !== "concepts" || !this.concepts) return;

  const cardIds = new Set();
  this.concepts.forEach((card, index) => {
    if (cardIds.has(card.id)) {
      this.invalidate(`concepts.${index}.id`, "Concept card IDs must be unique within a question");
    }
    cardIds.add(card.id);
  });
});

const activitySchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Activity owner is required"],
      immutable: true,
    },

    title: {
      type: String,
      required: [true, "Activity title is required"],
      trim: true,
      maxlength: [80, "Activity title must be at most 80 characters"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Activity description must be at most 500 characters"],
      default: "",
    },

    color: {
      type: String,
      required: [true, "Activity color is required"],
      match: [/^#[0-9A-Fa-f]{6}$/, "Activity color must be a six-digit hex value"],
      default: "#087b55",
    },

    icon: {
      type: String,
      enum: ["book", "spell", "calculator", "palette", "bulb", "flask", "puzzle", "brain"],
      default: "book",
    },

    link: {
      type: String,
      required: [true, "Activity link is required"],
      trim: true,
    },

    code: {
      type: String,
      trim: true,
      maxlength: 64,
      default: undefined,
    },

    active: {
      type: Boolean,
      default: true,
    },

    questions: {
      type: [activityQuestionSchema],
      default: [],
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

activitySchema.pre("validate", function validateUniqueQuestionIds() {
  const questionIds = new Set();
  this.questions.forEach((question, index) => {
    if (questionIds.has(question.id)) {
      this.invalidate(`questions.${index}.id`, "Question IDs must be unique within an activity");
    }
    questionIds.add(question.id);
  });
});

activitySchema.index({ teacher: 1, createdAt: -1, _id: -1 });
activitySchema.index({ code: 1 }, { unique: true, sparse: true });

export const Activity = mongoose.model("Activity", activitySchema);
export default Activity;