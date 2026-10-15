import mongoose from "mongoose";
import Interview from "../models/interviewModel.js";
import InterviewSession from "../models/sessionModel.js";
import { evaluateAnswer } from "../services/answerEvaluationService.js";
import { generateFollowUp } from "../services/followUpService.js";



const getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID or user",
      });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      user: userId,
    }).select("status report overallScore startedAt completedAt");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found",
      });
    }

    if (session.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Complete the interview before retrieving its final report",
      });
    }

    if (!session.report) {
      return res.status(404).json({
        success: false,
        message: "Report not found for this session",
      });
    }

    return res.status(200).json({
      success: true,
      status: session.status,
      overallScore: session.overallScore,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      report: session.report,
    });
  } catch (error) {
    console.error("getInterviewReport error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve interview report",
    });
  }
};

const endInterviewSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID or user",
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

    // Ending an already completed session is idempotent.
    if (session.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Interview is already completed",
        report: session.report,
        overallScore: session.overallScore,
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview session cannot be ended",
      });
    }

    const answeredQuestions = session.questions.filter(
      (question) => question.answeredAt
    );

    const scores = answeredQuestions
      .filter(
        (question) =>
          typeof question.evaluation?.score === "number"
      )
      .map((question) => question.evaluation.score);

    const averageScore = scores.length
      ? Number(
          (
            scores.reduce((sum, score) => sum + score, 0) /
            scores.length
          ).toFixed(2)
        )
      : 0;

    const totalQuestions = session.questions.length;
    const answeredCount = answeredQuestions.length;
    const unansweredCount = totalQuestions - answeredCount;

    const questionResults = session.questions.map((question) => ({
      questionId: question._id,
      questionText: question.questionText,
      category: question.category,
      difficulty: question.difficulty,
      isFollowUp: question.isFollowUp,
      answered: Boolean(question.answeredAt),
      answer: question.answer || "",
      score:
        typeof question.evaluation?.score === "number"
          ? question.evaluation.score
          : null,
      feedback: question.evaluation?.feedback || "",
      strengths: question.evaluation?.strengths || [],
      weaknesses: question.evaluation?.weaknesses || [],
    }));

    const report = {
      generatedAt: new Date(),
      totalQuestions,
      answeredQuestions: answeredCount,
      unansweredQuestions: unansweredCount,
      evaluatedQuestions: scores.length,
      overallScore: averageScore,
      completionPercentage: totalQuestions
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0,
      questionResults,
    };

    session.status = "completed";
    session.completedAt = new Date();
    session.overallScore = averageScore;
    session.report = report;

    await session.save();

    return res.status(200).json({
      success: true,
      message: "Interview ended and report generated",
      report,
    });
  } catch (error) {
    console.error("endInterviewSession error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to end interview session",
    });
  }
};

const getCurrentQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID or user",
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

    if (session.status === "completed") {
      return res.status(200).json({
        success: true,
        status: "completed",
        message: "Interview has already been completed",
      });
    }

    if (session.status !== "in_progress") {
      return res.status(400).json({
        success: false,
        message: "Interview session is not in progress",
      });
    }

    const question =
      session.questions[session.currentQuestionIndex];

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Current question not found",
      });
    }

    return res.status(200).json({
      success: true,
      status: session.status,
      progress: {
        current: session.currentQuestionIndex + 1,
        total: session.questions.length,
      },
      question: {
        _id: question._id,
        questionText: question.questionText,
        category: question.category,
        difficulty: question.difficulty,
        isFollowUp: question.isFollowUp,
        answered: Boolean(question.answeredAt),
        answer: question.answer || "",
        ...(question.answeredAt
          ? { evaluation: question.evaluation }
          : {}),
      },
    });
  } catch (error) {
    console.error("getCurrentQuestion error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve current question",
    });
  }
};

const nextQuestion = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !userId
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID or user",
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
        message: "Interview session is not in progress",
      });
    }

    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];

    if (!currentQuestion) {
      return res.status(400).json({
        success: false,
        message: "No current question found",
      });
    }

    if (!currentQuestion.answeredAt || !currentQuestion.answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Submit your answer before requesting the next question",
      });
    }

    const interview = await Interview.findOne({
      _id: session.interview,
      user: userId,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Associated interview not found",
      });
    }

    // Track follow-ups against the original question, not array indexes.
    const originalId =
      currentQuestion.originalQuestionId?.toString() ||
      currentQuestion._id.toString();

    const followUpCount =
      session.followUpCounts.get(originalId) || 0;

    // Do not ask follow-ups to a follow-up question.
    // Limit each original question to two follow-ups.
    let decision = { action: "next", question: null };

    if (!currentQuestion.isFollowUp && followUpCount < 2) {
      decision = await generateFollowUp({
        question: currentQuestion.questionText,
        answer: currentQuestion.answer,
        feedback: currentQuestion.evaluation?.feedback || "",
        weaknesses: currentQuestion.evaluation?.weaknesses || [],
        jobRole: interview.jobRole,
        difficulty: currentQuestion.difficulty || interview.difficulty,
        followUpCount,
      });
    }

    if (decision.action === "follow_up") {
      const followUp = decision.question;

      const newQuestion = {
        originalQuestionId: currentQuestion.originalQuestionId || null,
        questionText: followUp.questionText,
        category: followUp.category || currentQuestion.category || "Technical",
        difficulty: followUp.difficulty || currentQuestion.difficulty || "Medium",
        expectedAnswer: followUp.expectedAnswer || "",
        answer: "",
        evaluation: undefined,
        isFollowUp: true,
        parentQuestionId: currentQuestion._id,
      };

      // Insert directly after the question just answered.
      session.questions.splice(currentIndex + 1, 0, newQuestion);
      session.currentQuestionIndex = currentIndex + 1;
      session.followUpCounts.set(originalId, followUpCount + 1);

      await session.save();

      const next = session.questions[session.currentQuestionIndex];

      return res.status(200).json({
        success: true,
        action: "follow_up",
        message: "Follow-up question generated",
        progress: {
          current: session.currentQuestionIndex + 1,
          total: session.questions.length,
        },
        question: {
          _id: next._id,
          questionText: next.questionText,
          category: next.category,
          difficulty: next.difficulty,
          isFollowUp: next.isFollowUp,
        },
      });
    }

    // AI chose "next": advance to the next question.
    const nextIndex = currentIndex + 1;

    if (nextIndex < session.questions.length) {
      session.currentQuestionIndex = nextIndex;
      await session.save();

      const next = session.questions[nextIndex];

      return res.status(200).json({
        success: true,
        action: "next",
        message: "Next question ready",
        progress: {
          current: nextIndex + 1,
          total: session.questions.length,
        },
        question: {
          _id: next._id,
          questionText: next.questionText,
          category: next.category,
          difficulty: next.difficulty,
          isFollowUp: next.isFollowUp,
        },
      });
    }

    // No questions remain: finish the session.
    const scores = session.questions
      .filter((q) => q.answeredAt && typeof q.evaluation?.score === "number")
      .map((q) => q.evaluation.score);

    session.status = "completed";
    session.completedAt = new Date();
    session.overallScore = scores.length
      ? Number(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length)
            .toFixed(2)
        )
      : 0;

    await session.save();

    return res.status(200).json({
      success: true,
      action: "completed",
      message: "Interview completed",
      overallScore: session.overallScore,
      totalQuestions: session.questions.length,
      answeredQuestions: session.questions.filter((q) => q.answeredAt).length,
    });
  } catch (error) {
    console.error("nextQuestion error:", error.message);

    return res.status(502).json({
      success: false,
      message: "Could not generate the next question. Please try again.",
    });
  }
};

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
      parentQuestionId: null,
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
export { startInterviewSession ,submitAnswer,nextQuestion ,getCurrentQuestion,endInterviewSession,getInterviewReport};
