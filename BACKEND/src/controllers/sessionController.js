import mongoose from "mongoose";
import Interview from "../models/interviewModel.js";
import InterviewSession from "../models/sessionModel.js";
import { evaluateAnswer } from "../services/answerEvaluationService.js";

const startInterviewSession = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }
    
    if (!mongoose.isValidObjectId(interviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview ID",
      });
    }

    // Find only an interview belonging to this user
    const interview = await Interview.findOne({
      _id: interviewId,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    if (interview.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "Interview is not ready to start",
      });
    }

    if (!interview.questions?.length) {
      return res.status(400).json({
        success: false,
        message: "No questions available for this interview",
      });
    }

    // Copy generated questions into this interview attempt
    const sessionQuestions = interview.questions.map((question) => ({
      originalQuestionId: question._id,
      questionText: question.questionText,
      category: question.category,
      difficulty: question.difficulty,
      expectedAnswer: question.expectedAnswer,
      answer: "",
      isFollowUp: false,
    }));

    const session = await InterviewSession.create({
      user: userId,
      interview: interview._id,
      questions: sessionQuestions,
      currentQuestionIndex: 0,
      status: "in_progress",
    });

    // Never expose expected answers to the candidate
    const firstQuestion = session.questions[0];

    return res.status(201).json({
      success: true,
      message: "Interview session started successfully",
      session: {
        _id: session._id,
        interview: session.interview,
        status: session.status,
        totalQuestions: session.questions.length,
        currentQuestionIndex: 0,
        currentQuestion: {
          _id: firstQuestion._id,
          questionText: firstQuestion.questionText,
          category: firstQuestion.category,
          difficulty: firstQuestion.difficulty,
        },
      },
    });
  } catch (error) {
    console.error("Start interview session error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start interview session",
    });
  }
};


const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answer } = req.body;

    const userId = req.user?.id || req.user?._id;

    if (!mongoose.isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    if (answer.trim().length > 10000) {
      return res.status(400).json({
        success: false,
        message: "Answer must not exceed 10000 characters",
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview session is not active",
      });
    }

    const question =
      session.questions[session.currentQuestionIndex];

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "No current question available",
      });
    }

    if (question.answeredAt) {
      return res.status(409).json({
        success: false,
        message: "This question has already been answered",
      });
    }

    // Load the interview configuration
    const interview = await Interview.findOne({
      _id: session.interview,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview configuration not found",
      });
    }

    // Evaluate the answer using the Python AI service
    const evaluation = await evaluateAnswer({
      question: question.questionText,
      expectedAnswer: question.expectedAnswer,
      answer: answer.trim(),
      jobRole: interview.jobRole,
      difficulty: question.difficulty,
    });

    // Validate the minimum evaluation contract
    if (
      !evaluation ||
      typeof evaluation.score !== "number" ||
      evaluation.score < 0 ||
      evaluation.score > 10 ||
      typeof evaluation.feedback !== "string"
    ) {
      throw new Error("AI returned an invalid evaluation");
    }

    // Persist the answer and evaluation
    question.answer = answer.trim();
    question.evaluation = {
      score: evaluation.score,
      correctness: evaluation.correctness,
      technicalDepth: evaluation.technicalDepth,
      clarity: evaluation.clarity,
      strengths: evaluation.strengths || [],
      weaknesses: evaluation.weaknesses || [],
      feedback: evaluation.feedback,
    };
    question.answeredAt = new Date();

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Answer evaluated successfully",
      evaluation: question.evaluation,
      progress: {
        answeredQuestions: session.questions.filter(
          (q) => q.answeredAt
        ).length,
        totalQuestions: session.questions.length,
        currentQuestionIndex: session.currentQuestionIndex,
      },
    });
  } catch (error) {
    console.error("Submit answer error:", {
      message: error.message,
      status: error.response?.status,
      response: error.response?.data,
      code: error.code,
      stack: error.stack,
    });

    return res.status(502).json({
      success: false,
      message: "Answer evaluation failed. Please try again.",
    });
  }
};
export { startInterviewSession ,submitAnswer};
