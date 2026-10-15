import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {startInterviewSession , submitAnswer} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/start/:interviewId",authMiddleware,startInterviewSession);
router.post("/:sessionId/answer",authMiddleware,submitAnswer);

export default router;
