import axios from "axios";

const evaluateAnswer = async ({
  question,
  expectedAnswer,
  answer,
  jobRole,
  difficulty,
}) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

  if (!AI_SERVICE_URL) {
    throw new Error("AI_SERVICE_URL is not configured");
  }

  const response = await axios.post(
    `${AI_SERVICE_URL}/evaluate-answer`,
    {
      question,
      expectedAnswer,
      answer,
      jobRole,
      difficulty,
    },
    {
      timeout: 60000,
    }
  );

  if (
    response.data?.success !== true ||
    !response.data?.evaluation
  ) {
    throw new Error("Invalid response from AI evaluation service");
  }

  return response.data.evaluation;
};

export { evaluateAnswer };
