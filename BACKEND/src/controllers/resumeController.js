import resumeModel from "../models/resumeModel.js";
import { extractResumeData } from "../services/resumeservice.js";
import fs from "node:fs/promises";

const uploadResume = async function uploadResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume",
      });
    }

    // Authentication middleware must set req.user.
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // DiskStorage provides a file path, not a buffer.
    const { extractedText, pageCount } =
      await extractResumeData(req.file.path);

    // Save resume details in MongoDB.
    const resume = await resumeModel.create({
      user: userId,
      originalName: req.file.originalname,
      extractedText,
      pageCount,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded and processed successfully",
      resume: {
        id: resume._id,
        originalName: resume.originalName,
        pageCount: resume.pageCount,
        createdAt: resume.createdAt,
      },
    });
  } catch (error) {
    console.error("Resume processing error:", error.message);

    return res.status(422).json({
      success: false,
      message: "Unable to process resume",
    });
  } finally {
    // Remove the temporary uploaded file after processing.
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (error) {
        console.error("Temporary resume cleanup failed:", error.message);
      }
    }
  }
}

const getMyResumes=  async function getMyResumes(req, res) {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const resumes = await resumeModel
      .find({ user: userId })
      .select("-extractedText")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: resumes.length,
      resumes,
    });
  } catch (error) {
    console.error("Fetching resumes failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch resumes",
    });
  }
}

export {uploadResume,getMyResumes}