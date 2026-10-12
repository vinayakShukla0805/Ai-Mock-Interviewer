import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
    },
    extractedText: {
      type: String,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
    },
    pageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Resume", resumeSchema);
