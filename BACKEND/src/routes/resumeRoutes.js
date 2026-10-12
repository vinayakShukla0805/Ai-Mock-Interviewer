import express from "express";
import upload from "../middleware/resumeMiddleware.js";
import {uploadResume,getMyResumes} from "../controllers/resumeController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", authMiddleware, upload.single("resume"), uploadResume );
router.get("/getResume",authMiddleware,getMyResumes);

export default router;
