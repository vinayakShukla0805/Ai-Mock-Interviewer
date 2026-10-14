import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Technical", "HR", "Behavioral", "Project", "Other"],
      default: "Technical",
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    expectedAnswer: {
      type: String,
      default: "",
    },
  },
  { _id: true }
);

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    jobRole: {
      type: String,
      required: true,
      trim: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Fresher", "Junior", "Mid-Level", "Senior"],
      default: "Fresher",
    },

    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Mixed","Behavioral"],
      default: "Technical",
    },

    skills: {
      type: [String],
      default: [],
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    totalQuestions: {
      type: Number,
      min: 1,
      default: 10,
    },
    questions: {
      type: [questionSchema],
      default: [],
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      default: null,
    },
    status: {
      type: String,
      enum: ["Draft", "Ready", "In Progress", "Completed"],
      default: "Draft",
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model("Interview", interviewSchema);
export default Interview;
