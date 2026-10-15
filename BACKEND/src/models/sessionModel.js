
import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
  {
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    correctness: {
      type: Number,
      min: 0,
      max: 10,
    },
    technicalDepth: {
      type: Number,
      min: 0,
      max: 10,
    },
    clarity: {
      type: Number,
      min: 0,
      max: 10,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const sessionQuestionSchema = new mongoose.Schema(
  {
    // Reference to the original generated question
    originalQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      default: "Technical",
    },

    difficulty: {
      type: String,
      default: "Medium",
    },

    expectedAnswer: {
      type: String,
      default: "",
    },

    answer: {
      type: String,
      default: "",
    },

    evaluation: {
      type: evaluationSchema,
      default: undefined,
    },

    isFollowUp: {
      type: Boolean,
      default: false,
    },

    parentQuestionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    interview: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    questions: {
      type: [sessionQuestionSchema],
      default: [],
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    overallScore: {
      type: Number,
      default: null,
    },

    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

const InterviewSession = mongoose.model(
  "InterviewSession",
  sessionSchema
);

export default InterviewSession;
