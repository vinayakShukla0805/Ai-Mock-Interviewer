# AI - MOCK INTERVIEWER 

### Backend Folder Structure

backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── aiConfig.js
│   │
│   ├── models/
│   │   ├── userModels.js
│   │   ├── Resume.js
│   │   ├── Interview.js
│   │   ├── Question.js
│   │   └── Evaluation.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── resumeController.js
│   │   ├── interviewController.js
│   │   ├── questionController.js
│   │   ├── evaluationController.js
│   │   └── reportController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── interviewRoutes.js
│   │   ├── questionRoutes.js
│   │   ├── evaluationRoutes.js
│   │   └── reportRoutes.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── resumeService.js
│   │   ├── interviewService.js
│   │   ├── questionService.js
│   │   ├── evaluationService.js
│   │   └── reportService.js
│   │
│   ├── ai/
│   │   ├── llmClient.js
│   │   ├── promptTemplates.js
│   │   ├── questionGenerator.js
│   │   ├── answerEvaluator.js
│   │   ├── feedbackGenerator.js
│   │   └── workflows/
│   │       ├── interviewWorkflow.js
│   │       └── evaluationWorkflow.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── rateLimitMiddleware.js
│   │
│   ├── validators/
│   │   ├── authValidator.js
│   │   └── interviewValidator.js
│   │
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── asyncHandler.js
│   │
│   ├── app.js
│   └── server.js
│
├── uploads/
│   └── .gitkeep
├── tests/
│   ├── auth.test.js
│   └── interview.test.js
├── .env
└── package.json