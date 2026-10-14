import Interview from "../models/interviewModel.js";

const createInterview = async (req, res) => {
  try {
    const {
      title,
      jobRole,
      experienceLevel,
      interviewType,
      skills,
      difficulty,
      totalQuestions,
      resume,
    } = req.body;

    // Validate required fields
    if (!title || !jobRole) {
      return res.status(400).json({
        success: false,
        message: "Title and job role are required",
      });
    }

    // Validate skills
    if (skills !== undefined && !Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    // Validate number of questions
    if (
      totalQuestions !== undefined &&
      (!Number.isInteger(totalQuestions) || totalQuestions < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Total questions must be a positive integer",
      });
    }

    // Get authenticated user from JWT middleware
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Create interview
    const interview = await Interview.create({
      user: userId,
      title,
      jobRole,
      experienceLevel,
      interviewType,
      skills,
      difficulty,
      totalQuestions,
      resume: resume || null,
      questions: [],
      status: "Draft",
    });

    return res.status(201).json({
      success: true,
      message: "Interview created successfully",
      interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default createInterview;