import mongoose from "mongoose";

// Schema for each answer submitted during a session
const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    answerText: {
      type: String,
      trim: true,
      default: "",
    },

    answeredAt: {
      type: Date,
      default: Date.now,
    },

    timeTaken: {
      type: Number,
      default: 0,
      min: 0,
    },

    score: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    feedback: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Main interview session schema
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
      index: true,
    },

    status: {
      type: String,
      enum: ["In Progress", "Completed", "Abandoned"],
      default: "In Progress",
    },

    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    totalScore: {
      type: Number,
      min: 0,
      default: null,
    },

    overallFeedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Export the model
const Session = mongoose.model("Session", sessionSchema);
export default Session;