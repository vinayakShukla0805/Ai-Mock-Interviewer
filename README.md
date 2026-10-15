## Backend Folder Structure

```text
backend/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── aiConfig.js
│   │
│   ├── models/
│   │   ├── userModels.js
│   │   ├── ResumeModel.js
│   │   ├── InterviewModel.js
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
```

### Directory Overview

- **`config/`** — Database connection and AI configuration.
- **`models/`** — Mongoose schemas and database models.
- **`controllers/`** — Handle incoming requests and send responses.
- **`routes/`** — Define API endpoints.
- **`services/`** — Contain business logic and reusable operations.
- **`ai/`** — LLM integration, prompt templates, question generation, answer evaluation, and AI workflows.
- **`middleware/`** — Authentication, error handling, file uploads, and rate limiting.
- **`validators/`** — Validate request data.
- **`utils/`** — Shared utility functions and error-handling helpers.
- **`app.js`** — Configure Express, middleware, and routes.
- **`server.js`** — Initialize the server and start listening for requests.
- **`uploads/`** — Store uploaded files when local file storage is used.
- **`tests/`** — Authentication and interview workflow tests.
- **`.env`** — Store environment variables and API credentials.
- **`package.json`** — Manage dependencies and npm scripts.

### Security Note

Do not commit `.env` to GitHub. Add it to `.gitignore` and provide a `.env.example` file containing placeholder values for the required environment variables.


# to run ai service
- source .venv/bin/activate
- python -m uvicorn main:app --reload --port 8000