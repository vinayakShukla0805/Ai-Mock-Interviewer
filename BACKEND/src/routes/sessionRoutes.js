import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {startInterviewSession , submitAnswer,nextQuestion ,getCurrentQuestion,endInterviewSession,getInterviewReport} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start/:interviewId", authMiddleware, startInterviewSession);
router.get("/:sessionId/current", authMiddleware, getCurrentQuestion);
router.post("/:sessionId/answer", authMiddleware, submitAnswer);
router.post("/:sessionId/next", authMiddleware, nextQuestion);
router.post("/:sessionId/end", authMiddleware, endInterviewSession);
router.get("/:sessionId/report", authMiddleware, getInterviewReport);

export default router;
