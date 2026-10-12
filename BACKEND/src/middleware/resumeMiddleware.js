import multer from "multer";

// Useful when immediately processing or uploading a file to cloud storage.
// const storage = multer.memoryStorage();


// Disk Storage to Store the Resume
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploaded_Resume/");
  },

  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Upload Resume
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !== "application/pdf" ||
      !file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      return cb(new Error("Only PDF resumes are allowed"));
    }
    cb(null, true);
  },
});

export default upload;
