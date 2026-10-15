import express from "express";
import  {createInterview , getInterviewById ,getInterviews , deleteInterview}  from "../controllers/interviewController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/createInterview", authMiddleware, createInterview);
router.get("/getInterviews", authMiddleware, getInterviews);
router.get("/getInterview/:id", authMiddleware, getInterviewById);
router.delete("/deleteInterview/:id",authMiddleware, deleteInterview);

export default router;
