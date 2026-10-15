import mongoose from "mongoose";
import Interview from "../models/interviewModel.js";
import { generateInterviewQuestions } from "../services/questionGenerationService.js";

const createInterview = async (req, res) => {
  try {
    const {
      title,
      jobRole,
      experienceLevel = "Fresher",
      interviewType = "Technical",
      skills = [],
      difficulty = "Medium",
      totalQuestions = 10,
      resume = null,
    } = req.body;

    // 1. Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof jobRole !== "string" ||
      !jobRole.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and job role are required",
      });
    }

    // 2. Validate authentication
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 3. Validate skills
    if (
      !Array.isArray(skills) ||
      skills.length > 30 ||
      skills.some(
        (skill) =>
          typeof skill !== "string" || !skill.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array of up to 30 non-empty strings",
      });
    }

    // 4. Validate enum fields
    const allowedExperienceLevels = [
      "Fresher",
      "Junior",
      "Mid-Level",
      "Senior",
    ];

    const allowedInterviewTypes = [
      "Technical",
      "HR",
      "Mixed",
    ];

    const allowedDifficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    if (!allowedExperienceLevels.includes(experienceLevel)) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience level",
      });
    }

    if (!allowedInterviewTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type",
      });
    }

    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: "Invalid difficulty level",
      });
    }

    // 5. Validate number of questions
    if (
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 1 ||
      totalQuestions > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "Total questions must be between 1 and 30",
      });
    }

    // 6. Validate optional resume ID
    if (
      resume !== null &&
      (typeof resume !== "string" ||
        !mongoose.isValidObjectId(resume))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume ID",
      });
    }

    // 7. Generate questions using Python + Mistral AI
    const questions = await generateInterviewQuestions({
      jobRole: jobRole.trim(),
      experienceLevel,
      interviewType,
      skills: skills.map((skill) => skill.trim()),
      difficulty,
      totalQuestions,
    });

    // 8. Save the interview in MongoDB
    const interview = await Interview.create({
      user: userId,
      title: title.trim(),
      jobRole: jobRole.trim(),
      experienceLevel,
      interviewType,
      skills: skills.map((skill) => skill.trim()),
      difficulty,
      totalQuestions,
      questions,
      resume,
      status: "Ready",
    });

    // 9. Return successful response
    return res.status(201).json({
      success: true,
      message: "Interview created and questions generated successfully",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(502).json({
      success: false,
      message: "Interview creation or AI question generation failed",
    });
  }
};


const getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: interviews.length,
      interviews,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/interviews/:id
const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    // Find by BOTH interview ID and authenticated user
    const interview = await Interview.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    const interview = await Interview.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { createInterview ,getInterviewById ,getInterviews ,deleteInterview};