import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getNextQuestion,
  submitAnswer,
  completeInterview,
} from "../services/interviewService";
import "./InterviewRoom.css";

export default function InterviewRoom() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadQuestion();
  }, [interviewId]);

  async function loadQuestion() {
    try {
      setLoading(true);
      setError("");

      const data = await getNextQuestion(interviewId);

      if (data.completed || data.question == null) {
        navigate(`/interview/${interviewId}/result`, {
          replace: true,
        });
        return;
      }

      setQuestion(data.question);
      setQuestionNumber(data.questionNumber ?? questionNumber);
      setTotalQuestions(data.totalQuestions ?? totalQuestions);
      setAnswer("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to load the question. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!question || !answer.trim()) {
      setError("Please enter your answer before continuing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await submitAnswer(interviewId, {
        questionId: question._id,
        answer: answer.trim(),
      });

      if (questionNumber >= totalQuestions) {
        const result = await completeInterview(interviewId);

        navigate(`/interview/${interviewId}/result`, {
          state: { result },
        });
      } else {
        await loadQuestion();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Unable to submit your answer. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !question) {
    return (
      <main className="interview-page">
        <div className="interview-card">
          <p>Loading your interview question...</p>
        </div>
      </main>
    );
  }

  if (error && !question) {
    return (
      <main className="interview-page">
        <div className="interview-card">
          <p className="error-message">{error}</p>
          <button onClick={loadQuestion}>Retry</button>
        </div>
      </main>
    );
  }

  if (!question) return null;

  const progress = Math.min(
    100,
    (questionNumber / totalQuestions) * 100
  );

  return (
    <main className="interview-page">
      <header className="interview-header">
        <div>
          <p className="eyebrow">AI MOCK INTERVIEWER</p>
          <h1>Interview Session</h1>
        </div>

        <span className="session-badge">In progress</span>
      </header>

      <section className="interview-card">
        <div className="progress-heading">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>

        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="question-meta">
          <span>{question.category || "Technical"}</span>
          <span>{question.difficulty || "Medium"} difficulty</span>
        </div>

        <h2 className="question-title">
          {question.questionText}
        </h2>

        <label htmlFor="candidate-answer" className="answer-label">
          Your answer
        </label>

        <textarea
          id="candidate-answer"
          className="answer-textarea"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="Explain your approach and provide examples where appropriate..."
          rows={8}
          disabled={submitting}
        />

        <div className="answer-footer">
          <span>{answer.trim().length} characters</span>
          <span>Take your time and be specific.</span>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        <div className="interview-actions">
          <button
            className="submit-answer-button"
            onClick={handleSubmitAnswer}
            disabled={submitting || !answer.trim()}
          >
            {submitting
              ? "Submitting..."
              : questionNumber >= totalQuestions
                ? "Submit Interview"
                : "Submit & Next Question"}
          </button>
        </div>
      </section>

      <p className="interview-note">
        Your progress depends on successful answer submissions.
        Keep this page open while completing the session.
      </p>
    </main>
  );
}